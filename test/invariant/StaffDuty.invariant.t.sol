// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {StaffFixture} from "../shared/duty/StaffFixture.sol";
import {Duty} from "../../src/shared/duty/Duty.sol";
import {Permission} from "../../src/shared/permission/Permission.sol";
import {IDuty} from "../../src/interfaces/IDuty.sol";
import {IAgentAccess} from "../../src/interfaces/IAgentAccess.sol";

/// @notice Manager tạo ca / vị trí ở hai chi nhánh, phân công ngẫu nhiên (kể cả chéo chi nhánh), nhân viên vào / ra ca,
///         thời gian trôi. Mọi lời gọi sai đều bị bắt (try/catch).
contract StaffDutyHandler is Test {
    Duty internal duty;
    Permission internal permission;
    address internal owner;
    uint64[2] internal branches;
    address[2] internal staffs;
    uint64[] internal shifts;
    uint64[] internal positions;
    uint256 public okCheckIn;
    uint256 public okAssign;

    constructor(Duty d, Permission p, address owner_, uint64 b1, uint64 b2, address s1, address s2) {
        duty = d;
        permission = p;
        owner = owner_;
        branches = [b1, b2];
        staffs = [s1, s2];
    }

    /// @dev Chỉ setUp gọi được (lần đầu); fuzzer gọi lại thì bỏ qua để không nhét id rác vào danh sách.
    function seed(uint64 shiftId, uint64 positionId) external {
        if (shifts.length != 0) return;
        shifts.push(shiftId);
        positions.push(positionId);
    }

    function createShift(uint256 b, uint16 start, uint16 len, uint8 weekdays) external {
        uint16 s = start % 1440;
        uint16 e = uint16((uint256(s) + 1 + len % 1439) % 1440);
        vm.prank(owner);
        try duty.createShift(branches[b % 2], "c", s, e, weekdays) returns (uint64 id) {
            shifts.push(id);
        } catch {}
    }

    function createPosition(uint256 b, uint64 mask) external {
        uint8[] memory ms = new uint8[](1);
        uint64[] memory masks = new uint64[](1);
        masks[0] = mask & 0xFF;
        vm.prank(owner);
        try permission.createPosition(branches[b % 2], "p", ms, masks) returns (uint64 id) {
            positions.push(id);
        } catch {}
    }

    function assign(uint256 b, uint256 who, uint256 si, uint256 pi) external {
        if (shifts.length == 0 || positions.length == 0) return;
        // Ở b1 luôn giữ cặp gốc (ca gần trọn ngày) để đường vào ca không bị fuzz chặn hết.
        bool keepSeed = b % 2 == 0;
        IDuty.Assignment[] memory list = new IDuty.Assignment[](keepSeed ? 2 : 1);
        list[0] = IDuty.Assignment(shifts[si % shifts.length], positions[pi % positions.length]);
        if (keepSeed) list[1] = IDuty.Assignment(shifts[0], positions[0]);
        vm.prank(owner);
        try duty.setAssignments(branches[b % 2], staffs[who % 2], list) {
            ++okAssign;
        } catch {}
    }

    /// @dev Vào ca theo các phân công đang có của nhân viên (thử lần lượt, dừng ở lần đầu thành công) để đường vào ca
    ///      được chạm ở mọi lượt fuzz.
    function checkIn(uint256 b, uint256 who) external {
        address account = staffs[who % 2];
        for (uint256 k; k < 2; ++k) {
            uint64 branchId = branches[(b + k) % 2];
            IDuty.Assignment[] memory list = duty.assignmentsOf(branchId, account);
            for (uint256 i; i < list.length; ++i) {
                vm.prank(account);
                try duty.checkIn(branchId, list[i].shiftId, list[i].positionId, 0) {
                    ++okCheckIn;
                    return;
                } catch {}
            }
        }
    }

    function checkOut(uint256 b, uint256 who) external {
        vm.prank(staffs[who % 2]);
        try duty.checkOut(branches[b % 2]) {} catch {}
    }

    function warp(uint256 secs) external {
        vm.warp(block.timestamp + secs % 1 days);
    }
}

contract StaffDutyInvariantTest is StaffFixture {
    StaffDutyHandler internal handler;

    function setUp() public override {
        super.setUp();
        vm.prank(agentOwner);
        agentAccess.grantRole(b2, staff, IAgentAccess.Role.Staff);
        handler = new StaffDutyHandler(duty, permission, agentOwner, b1, b2, staff, staff2);
        // Ca gần trọn ngày ở b1 để handler vào ca được thường xuyên.
        vm.startPrank(agentOwner);
        uint64 s = duty.createShift(b1, "ca dai", 0, 1439, ALL_DAYS);
        uint8[] memory ms = new uint8[](1);
        uint64[] memory masks = new uint64[](1);
        masks[0] = 0xFF;
        uint64 p = permission.createPosition(b1, "p", ms, masks);
        IDuty.Assignment[] memory list = new IDuty.Assignment[](1);
        list[0] = IDuty.Assignment(s, p);
        duty.setAssignments(b1, staff, list);
        duty.setAssignments(b1, staff2, list);
        vm.stopPrank();
        handler.seed(s, p);
        targetContract(address(handler));
    }

    /// @dev Handler chạm được đường vào ca (không chỉ toàn lời gọi bị từ chối). Phân công ngẫu nhiên phần lớn bị từ chối
    ///      (chéo chi nhánh) — đúng mục đích kiểm `invariant_assignmentsSameBranch`.
    function afterInvariant() public view {
        assertGt(handler.okCheckIn(), 0, "checkIn");
    }

    /// @dev Phân công không bao giờ trỏ vào ca / vị trí của chi nhánh khác.
    function invariant_assignmentsSameBranch() public view {
        uint64[2] memory bs = [b1, b2];
        address[2] memory ss = [staff, staff2];
        for (uint256 i; i < 2; ++i) {
            for (uint256 j; j < 2; ++j) {
                IDuty.Assignment[] memory list = duty.assignmentsOf(bs[i], ss[j]);
                assertLe(list.length, 16);
                for (uint256 k; k < list.length; ++k) {
                    assertEq(duty.getShift(list[k].shiftId).branchId, bs[i], "ca khac chi nhanh");
                    (uint64 pb,) = permission.positionStatus(list[k].positionId);
                    assertEq(pb, bs[i], "vi tri khac chi nhanh");
                }
            }
        }
    }

    /// @dev Staff không bao giờ có quyền chỉ Manager; không có phiên trực thì không có quyền nào.
    function invariant_staffPermissionsBounded() public view {
        uint64[2] memory bs = [b1, b2];
        address[2] memory ss = [staff, staff2];
        for (uint256 i; i < 2; ++i) {
            for (uint256 j; j < 2; ++j) {
                (bool onDuty,) = duty.activeSessionOf(bs[i], ss[j]);
                for (uint8 perm; perm < 11; ++perm) {
                    bool ok = permission.can(bs[i], ss[j], 0, perm);
                    if (perm >= 8) assertFalse(ok, "staff co quyen chi Manager");
                    if (!onDuty) assertFalse(ok, "khong truc ma co quyen");
                }
            }
        }
    }
}
