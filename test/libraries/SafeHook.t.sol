// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {SafeHook} from "../../src/libraries/SafeHook.sol";
import {ILoyaltyHook, IHookEvents} from "../../src/interfaces/ILoyaltyHook.sol";

uint256 constant HOOK_GAS = 50_000;
uint8 constant EVT_VERSION = 1;
uint8 constant LOYALTY_AS_TARGET = 3;
bytes32 constant REF = bytes32(uint256(0xBEEF));

contract SafeHookTest is Test {
    HookCaller internal caller;

    function setUp() public {
        caller = new HookCaller();
    }

    function _payload() internal pure returns (bytes memory) {
        return abi.encodeCall(
            ILoyaltyHook.onSpend, (uint8(1), uint64(1), uint64(10), address(0xCafe), uint8(1), REF, uint128(99))
        );
    }

    function _run(address hook, bytes memory data, uint256 gasLimit) internal returns (uint256 gasUsed, bool mainOk) {
        uint256 g0 = gasleft();
        mainOk = caller.run(hook, data, gasLimit, LOYALTY_AS_TARGET, REF);
        gasUsed = g0 - gasleft();
    }

    function test_zeroHook_failsWithoutCall() public {
        (uint256 used, bool ok) = _run(address(0), _payload(), HOOK_GAS);
        assertTrue(ok);
        assertFalse(caller.lastOk());
        assertLt(used, 50_000, "chi overhead nhe");
    }

    function test_success_happyPath() public {
        MockOkHook hook = new MockOkHook();
        (uint256 used, bool mainOk) = _run(address(hook), _payload(), HOOK_GAS);
        assertTrue(mainOk);
        assertTrue(caller.lastOk());
        assertLt(used, 120_000);
    }

    function test_revert_hookFailsMainSucceeds() public {
        MockRevertHook hook = new MockRevertHook();
        vm.expectEmit(true, true, true, true);
        emit IHookEvents.HookFailed(EVT_VERSION, LOYALTY_AS_TARGET, address(hook), REF, _payload());
        (, bool mainOk) = _run(address(hook), _payload(), HOOK_GAS);
        assertTrue(mainOk);
        assertFalse(caller.lastOk());
    }

    function test_infiniteLoop_hookFailsMainSucceeds() public {
        MockInfiniteHook hook = new MockInfiniteHook();
        vm.expectEmit(true, true, true, true);
        emit IHookEvents.HookFailed(EVT_VERSION, LOYALTY_AS_TARGET, address(hook), REF, _payload());
        (uint256 used, bool mainOk) = _run(address(hook), _payload(), HOOK_GAS);
        assertTrue(mainOk);
        assertFalse(caller.lastOk());
        assertLt(used, HOOK_GAS + 80_000);
    }

    function test_outOfGasInHook_hookFailsMainSucceeds() public {
        MockGasBurner hook = new MockGasBurner();
        vm.expectEmit(true, true, true, true);
        emit IHookEvents.HookFailed(EVT_VERSION, LOYALTY_AS_TARGET, address(hook), REF, _payload());
        (uint256 used, bool mainOk) = _run(address(hook), _payload(), HOOK_GAS);
        assertTrue(mainOk);
        assertFalse(caller.lastOk());
        assertLt(used, HOOK_GAS + 80_000);
    }

    function test_hugeReturndata_doesNotBlowMainTx() public {
        MockHugeReturn hook = new MockHugeReturn();
        vm.expectEmit(true, true, true, true);
        emit IHookEvents.HookFailed(EVT_VERSION, LOYALTY_AS_TARGET, address(hook), REF, _payload());
        (uint256 used, bool mainOk) = _run(address(hook), _payload(), HOOK_GAS);
        assertTrue(mainOk);
        assertFalse(caller.lastOk());
        assertLt(used, HOOK_GAS + 250_000);
    }

    function test_eoaNoCode_hookFailsMainSucceeds() public {
        address eoa = makeAddr("eoa");
        vm.expectEmit(true, true, true, true);
        emit IHookEvents.HookFailed(EVT_VERSION, LOYALTY_AS_TARGET, eoa, REF, _payload());
        (, bool mainOk) = _run(eoa, _payload(), HOOK_GAS);
        assertTrue(mainOk);
        assertFalse(caller.lastOk());
    }

    function test_reentrancy_mainStillSucceeds() public {
        MockReentrantHook hook = new MockReentrantHook(caller);
        bytes memory data = _payload();
        hook.setReplay(address(hook), data, HOOK_GAS, LOYALTY_AS_TARGET, REF);
        (uint256 used, bool mainOk) = _run(address(hook), data, HOOK_GAS);
        assertTrue(mainOk);
        assertLt(used, 350_000);
    }

    function test_insufficientFrameGas_skipsHook() public {
        FrameGasHost host = new FrameGasHost();
        MockOkHook hook = new MockOkHook();
        bytes memory data = _payload();
        uint256 gasLimit = 50_000;
        (bool mainOk, bool hookOk) = host.tightFrame(address(hook), data, gasLimit);
        assertTrue(mainOk);
        assertFalse(hookOk);
    }
}

/// @dev Goi `SafeHook` trong khung gas co y thieu nen (63/64 + du phong).
contract FrameGasHost {
    function tightFrame(address hook, bytes memory data, uint256 gasLimit) external returns (bool mainOk, bool hookOk) {
        uint256 cap = gasLimit + gasLimit / 63 + 5000 - 1;
        (bool success, bytes memory ret) =
            address(this).call{gas: cap}(abi.encodeCall(this._invoke, (hook, data, gasLimit)));
        if (!success) {
            return (false, false);
        }
        (mainOk, hookOk) = abi.decode(ret, (bool, bool));
    }

    function _invoke(address hook, bytes memory data, uint256 gasLimit) external returns (bool mainOk, bool hookOk) {
        hookOk = SafeHook.call(hook, data, gasLimit);
        mainOk = true;
    }
}

/// @dev Module gọi hook — mô phỏng pattern phát `HookFailed`.
contract HookCaller is IHookEvents {
    bool public lastOk;
    uint32 public depth;

    function run(address hook, bytes memory data, uint256 gasLimit, uint8 loyaltyModuleId, bytes32 refId)
        external
        returns (bool mainOk)
    {
        ++depth;
        lastOk = SafeHook.call(hook, data, gasLimit);
        if (!lastOk) emit HookFailed(EVT_VERSION, loyaltyModuleId, hook, refId, data);
        mainOk = true;
        --depth;
    }
}

contract MockOkHook is ILoyaltyHook {
    function onSpend(uint8, uint64, uint64, address, uint8, bytes32, uint128) external pure {}
}

contract MockRevertHook is ILoyaltyHook {
    function onSpend(uint8, uint64, uint64, address, uint8, bytes32, uint128) external pure {
        revert();
    }
}

contract MockInfiniteHook is ILoyaltyHook {
    function onSpend(uint8, uint64, uint64, address, uint8, bytes32, uint128) external pure {
        while (true) {}
    }
}

contract MockGasBurner is ILoyaltyHook {
    function onSpend(uint8, uint64, uint64, address, uint8, bytes32, uint128) external pure {
        uint256 n;
        while (true) {
            ++n;
        }
    }
}

contract MockHugeReturn is ILoyaltyHook {
    function onSpend(uint8, uint64, uint64, address, uint8, bytes32, uint128) external pure {
        assembly {
            let ptr := mload(0x40)
            let size := 0x30000
            mstore(0x40, add(ptr, size))
            return(ptr, size)
        }
    }
}

contract MockReentrantHook is ILoyaltyHook {
    HookCaller immutable host;
    address internal replayHook;
    bytes internal replayData;
    uint256 internal replayGas;
    uint8 internal replayModuleId;
    bytes32 internal replayRef;

    constructor(HookCaller h) {
        host = h;
    }

    function setReplay(address hook, bytes memory data, uint256 gasLimit, uint8 mod, bytes32 ref) external {
        replayHook = hook;
        replayData = data;
        replayGas = gasLimit;
        replayModuleId = mod;
        replayRef = ref;
    }

    function onSpend(uint8, uint64, uint64, address, uint8, bytes32, uint128) external {
        host.run(replayHook, replayData, replayGas, replayModuleId, replayRef);
    }
}
