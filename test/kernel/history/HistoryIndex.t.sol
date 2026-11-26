// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {BaseTest} from "../../utils/BaseTest.sol";
import {MockFullDB} from "../../utils/MockFullDB.sol";
import {PlatformAccess} from "../../../src/kernel/access/PlatformAccess.sol";
import {HistoryIndex} from "../../../src/kernel/history/HistoryIndex.sol";
import {IHistoryIndex} from "../../../src/interfaces/IHistoryIndex.sol";
import {IPlatformAccess} from "../../../src/interfaces/IPlatformAccess.sol";

contract HistoryIndexTest is BaseTest {
    MockFullDB internal fulldb;
    PlatformAccess internal access;
    HistoryIndex internal hi;
    address internal writer;

    function setUp() public override {
        super.setUp();
        writer = makeAddr("writerModule");
        fulldb = installMockFullDB();
        access = PlatformAccess(
            deployProxy(address(new PlatformAccess()), abi.encodeCall(PlatformAccess.initialize, (platformOwner)))
        );
        hi = HistoryIndex(
            deployProxy(
                address(new HistoryIndex()), abi.encodeCall(HistoryIndex.initialize, (address(access), address(0)))
            )
        );
        vm.startPrank(platformOwner);
        hi.setWriter(writer, true);
        hi.setWriterKind(writer, "topups", true);
        vm.stopPrank();
    }

    // ─── helpers ────────────────────────────────────────────────────────

    function _terms(string memory p, string memory v) internal pure returns (IHistoryIndex.Term[] memory t) {
        t = new IHistoryIndex.Term[](1);
        t[0] = IHistoryIndex.Term(p, v);
    }

    function _vals(uint256 ts, uint256 amount) internal pure returns (IHistoryIndex.Value[] memory v) {
        v = new IHistoryIndex.Value[](2);
        v[0] = IHistoryIndex.Value(0, ts);
        v[1] = IHistoryIndex.Value(1, amount);
    }

    function _q(IHistoryIndex.Term[] memory f, int64 sortSlot, bool asc, uint64 offset, uint64 limit)
        internal
        pure
        returns (IHistoryIndex.Query memory q)
    {
        q.filters = f;
        q.ranges = new IHistoryIndex.Range[](0);
        q.sortSlot = sortSlot;
        q.ascending = asc;
        q.offset = offset;
        q.limit = limit;
    }

    function _append(uint64 agentId, string memory branch, uint256 ts, uint256 amount) internal returns (uint256) {
        vm.prank(writer);
        return hi.append(agentId, "topups", abi.encode(branch, amount), _terms("B", branch), _vals(ts, amount));
    }

    // ─── cấu hình ───────────────────────────────────────────────────────

    function test_initialize_defaultsToPrecompile() public view {
        assertEq(hi.fullDB(), FULLDB_PRECOMPILE);
        assertEq(address(hi.platformAccess()), address(access));
    }

    function test_setWriter_onlyOwner() public {
        vm.prank(platformAdmin);
        vm.expectRevert(abi.encodeWithSelector(IPlatformAccess.NotPlatformOwner.selector, platformAdmin));
        hi.setWriter(stranger, true);

        vm.prank(platformOwner);
        hi.setWriter(writer, false);
        assertFalse(hi.isWriter(writer));
    }

    /// Địa chỉ FullDB cố định từ initialize: đổi kho giữa chừng làm `dbReady`/`docUsed` và mọi `profileDocId` sai.
    function test_noSetFullDB() public {
        vm.prank(platformOwner);
        (bool ok,) = address(hi).call(abi.encodeWithSignature("setFullDB(address)", stranger));
        assertFalse(ok);
        assertEq(hi.fullDB(), FULLDB_PRECOMPILE);
    }

    function test_setWriterKind_onlyOwner_andValidates() public {
        vm.prank(platformAdmin);
        vm.expectRevert(abi.encodeWithSelector(IPlatformAccess.NotPlatformOwner.selector, platformAdmin));
        hi.setWriterKind(writer, "orders", true);

        vm.startPrank(platformOwner);
        vm.expectRevert(IHistoryIndex.ZeroAddress.selector);
        hi.setWriterKind(address(0), "orders", true);
        vm.expectRevert(IHistoryIndex.InvalidKind.selector);
        hi.setWriterKind(writer, "Orders", true);

        vm.expectEmit(address(hi));
        emit IHistoryIndex.WriterKindSet(1, writer, keccak256("orders"), "orders", true);
        hi.setWriterKind(writer, "orders", true);
        vm.stopPrank();
        assertTrue(hi.canWrite(writer, "orders"));
        assertFalse(hi.canWrite(writer, "payments"));
        assertFalse(hi.canWrite(stranger, "orders"));
    }

    /// Writer chỉ ghi được kind đã cấp: một module lỗi không ghi đè được dữ liệu của module khác.
    function test_append_rejectsKindNotGranted() public {
        vm.prank(writer);
        vm.expectRevert(abi.encodeWithSelector(IHistoryIndex.KindNotAllowed.selector, writer, "platform_agents"));
        hi.append(0, "platform_agents", "x", _terms("B", "1"), _vals(1, 1));
    }

    function test_replace_rejectsKindNotGranted() public {
        // Writer khác ghi `platform_agents`; `writer` (chỉ có `topups`) không thay được document đó.
        address other = makeAddr("otherModule");
        vm.startPrank(platformOwner);
        hi.setWriter(other, true);
        hi.setWriterKind(other, "platform_agents", true);
        vm.stopPrank();
        vm.prank(other);
        uint256 id = hi.append(0, "platform_agents", "profile", _terms("B", "1"), _vals(1, 1));

        vm.prank(writer);
        vm.expectRevert(abi.encodeWithSelector(IHistoryIndex.KindNotAllowed.selector, writer, "platform_agents"));
        hi.replace(0, "platform_agents", id, "forged");
        assertEq(hi.get(0, "platform_agents", id), "profile");
    }

    /// Thu kind hoặc tắt công tắc tổng đều chặn ghi.
    function test_writer_revokeKindOrSwitch() public {
        vm.prank(platformOwner);
        hi.setWriterKind(writer, "topups", false);
        vm.prank(writer);
        vm.expectRevert(abi.encodeWithSelector(IHistoryIndex.KindNotAllowed.selector, writer, "topups"));
        hi.append(1, "topups", "x", _terms("B", "1"), _vals(1, 1));

        vm.startPrank(platformOwner);
        hi.setWriterKind(writer, "topups", true);
        hi.setWriter(writer, false);
        vm.stopPrank();
        assertFalse(hi.canWrite(writer, "topups"));
        vm.prank(writer);
        vm.expectRevert(abi.encodeWithSelector(IHistoryIndex.NotWriter.selector, writer));
        hi.append(1, "topups", "x", _terms("B", "1"), _vals(1, 1));
    }

    function test_dbName() public view {
        assertEq(hi.dbName(0, "platform_agents"), "mp1_platform_agents");
        assertEq(hi.dbName(12, "topups"), "mp1_topups_12");
    }

    function test_dbName_rejectsBadKind() public {
        vm.expectRevert(IHistoryIndex.InvalidKind.selector);
        hi.dbName(1, "");
        vm.expectRevert(IHistoryIndex.InvalidKind.selector);
        hi.dbName(1, "Topups");
        vm.expectRevert(IHistoryIndex.InvalidKind.selector);
        hi.dbName(1, "a-b");
        vm.expectRevert(IHistoryIndex.InvalidKind.selector);
        hi.dbName(1, "abcdefghijklmnopqrstuvwxyz0123456"); // 33
    }

    // ─── ghi ────────────────────────────────────────────────────────────

    /// F1/F2 của hệ cũ: người lạ không ghi được.
    function test_append_onlyWriter() public {
        vm.prank(stranger);
        vm.expectRevert(abi.encodeWithSelector(IHistoryIndex.NotWriter.selector, stranger));
        hi.append(1, "topups", "x", _terms("B", "1"), _vals(1, 1));
    }

    function test_append_storesDataTermsValues() public {
        uint256 id = _append(7, "3", 1000, 50_000);
        assertEq(id, 1);
        assertEq(hi.get(7, "topups", id), abi.encode("3", uint256(50_000)));
        string[] memory t = fulldb.termsOf("mp1_topups_7", id);
        assertEq(t.length, 2);
        assertEq(t[0], "A7");
        assertEq(t[1], "B3");
        assertEq(fulldb.valueOf("mp1_topups_7", id, 0), "00000000000000001000");
        assertEq(fulldb.valueOf("mp1_topups_7", id, 1), "00000000000000050000");
    }

    function test_append_emits() public {
        vm.expectEmit(address(hi));
        emit IHistoryIndex.HistoryAppended(1, 7, keccak256("topups"), 1, keccak256(abi.encode("3", uint256(5))));
        _append(7, "3", 1, 5);
    }

    function test_append_createsDbOnce() public {
        _append(7, "3", 1, 1);
        uint256 before = fulldb.writeCount();
        _append(7, "3", 2, 2);
        // lần hai: newDocument + 2 term + 2 value, không gọi lại getOrCreateDb
        assertEq(fulldb.writeCount() - before, 5);
    }

    function test_append_limits() public {
        IHistoryIndex.Term[] memory many = new IHistoryIndex.Term[](9);
        vm.prank(writer);
        vm.expectRevert(abi.encodeWithSelector(IHistoryIndex.TooManyTerms.selector, 8));
        hi.append(1, "topups", "", many, new IHistoryIndex.Value[](0));

        IHistoryIndex.Value[] memory vals = new IHistoryIndex.Value[](5);
        vm.prank(writer);
        vm.expectRevert(abi.encodeWithSelector(IHistoryIndex.TooManyValues.selector, 4));
        hi.append(1, "topups", "", new IHistoryIndex.Term[](0), vals);
    }

    function test_append_reservedPrefix() public {
        vm.prank(writer);
        vm.expectRevert(IHistoryIndex.ReservedPrefix.selector);
        hi.append(1, "topups", "", _terms("A", "2"), new IHistoryIndex.Value[](0));
    }

    function test_append_badSlot() public {
        IHistoryIndex.Value[] memory v = new IHistoryIndex.Value[](1);
        v[0] = IHistoryIndex.Value(16, 1);
        vm.prank(writer);
        vm.expectRevert(IHistoryIndex.InvalidSortSlot.selector);
        hi.append(1, "topups", "", new IHistoryIndex.Term[](0), v);
    }

    /// F5 của hệ cũ: precompile trả docId đã dùng → revert, không ghi đè bản ghi cũ.
    function test_append_docIdConflictReverts() public {
        _append(7, "3", 1, 1);
        fulldb.setForceNextDocId(1);
        vm.prank(writer);
        vm.expectRevert(abi.encodeWithSelector(IHistoryIndex.DocIdConflict.selector, 1));
        hi.append(7, "topups", "dup", _terms("B", "3"), _vals(1, 1));
    }

    /// F4 của hệ cũ: lỗi FullDB không bị nuốt.
    function test_append_fullDBFailureReverts() public {
        fulldb.setFailWrites(true);
        vm.prank(writer);
        vm.expectRevert(MockFullDB.MockWriteFailed.selector);
        hi.append(7, "topups", "", _terms("B", "3"), _vals(1, 1));
    }

    function test_replace() public {
        uint256 id = _append(7, "3", 1, 1);
        vm.prank(writer);
        hi.replace(7, "topups", id, "new");
        assertEq(hi.get(7, "topups", id), "new");
        // term giữ nguyên
        assertEq(fulldb.termsOf("mp1_topups_7", id).length, 2);
    }

    function test_replace_unknownDocReverts() public {
        _append(7, "3", 1, 1);
        vm.prank(writer);
        vm.expectRevert(abi.encodeWithSelector(IHistoryIndex.UnknownDocument.selector, 2));
        hi.replace(7, "topups", 2, "x");
    }

    function test_replace_onlyWriter() public {
        uint256 id = _append(7, "3", 1, 1);
        vm.prank(stranger);
        vm.expectRevert(abi.encodeWithSelector(IHistoryIndex.NotWriter.selector, stranger));
        hi.replace(7, "topups", id, "x");
    }

    // ─── đọc ────────────────────────────────────────────────────────────

    function test_search_filterSortPaginate() public {
        _append(7, "1", 300, 10);
        _append(7, "2", 100, 20);
        _append(7, "1", 200, 30);
        _append(7, "1", 400, 40);
        _append(8, "1", 500, 50); // agent khác: DB khác

        IHistoryIndex.Page memory p = hi.search(7, "topups", _q(_terms("B", "1"), 0, false, 0, 2));
        assertEq(p.total, 3);
        assertEq(p.docIds.length, 2);
        assertEq(p.docIds[0], 4); // ts 400
        assertEq(p.docIds[1], 1); // ts 300

        p = hi.search(7, "topups", _q(_terms("B", "1"), 0, false, 2, 2));
        assertEq(p.docIds.length, 1);
        assertEq(p.docIds[0], 3); // ts 200

        p = hi.search(7, "topups", _q(new IHistoryIndex.Term[](0), 0, true, 0, 10));
        assertEq(p.total, 4);
        assertEq(p.docIds[0], 2); // ts 100
    }

    function test_search_range() public {
        _append(7, "1", 100, 10);
        _append(7, "1", 200, 20);
        _append(7, "1", 300, 30);
        IHistoryIndex.Query memory q = _q(new IHistoryIndex.Term[](0), -1, true, 0, 10);
        q.ranges = new IHistoryIndex.Range[](1);
        q.ranges[0] = IHistoryIndex.Range(0, 150, 300);
        IHistoryIndex.Page memory p = hi.search(7, "topups", q);
        assertEq(p.total, 2);
    }

    function test_search_emptyDb() public view {
        IHistoryIndex.Page memory p = hi.search(99, "topups", _q(new IHistoryIndex.Term[](0), -1, true, 0, 10));
        assertEq(p.total, 0);
    }

    function test_search_rejects() public {
        vm.expectRevert(abi.encodeWithSelector(IHistoryIndex.InvalidLimit.selector, 100));
        hi.search(7, "topups", _q(new IHistoryIndex.Term[](0), -1, true, 0, 0));
        vm.expectRevert(abi.encodeWithSelector(IHistoryIndex.InvalidLimit.selector, 100));
        hi.search(7, "topups", _q(new IHistoryIndex.Term[](0), -1, true, 0, 101));
        vm.expectRevert(IHistoryIndex.InvalidSortSlot.selector);
        hi.search(7, "topups", _q(new IHistoryIndex.Term[](0), -2, true, 0, 1));
        vm.expectRevert(IHistoryIndex.ReservedPrefix.selector);
        hi.search(7, "topups", _q(_terms("A", "8"), -1, true, 0, 1));
    }
}
