// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/TeamManager.sol";

contract TeamManagerTest is Test {
    TeamManager tm;
    address owner = address(0xA1);
    address user1 = address(0xB1);
    address user2 = address(0xC1);

    function setUp() public {
        tm = new TeamManager();
    }

    /// -------------------------
    ///  STAGE 1 TESTS
    /// -------------------------

    function testCreateTeam() public {
        vm.prank(owner);
        uint256 id = tm.createTeam();

        assertEq(id, 1);
        assertEq(tm.teamOwner(id), owner);
        assertEq(tm.teamCommitment(id), bytes32(0));
    }

    /// -------------------------
    ///  STAGE 2 TESTS
    /// -------------------------

    function testOwnerCanInvite() public {
        vm.prank(owner);
        uint256 id = tm.createTeam();

        vm.prank(owner);
        tm.inviteUser(id, user1);

        assertEq(tm.pendingInvites(id, user1), true);
    }

    function testNonOwnerCannotInvite() public {
        vm.prank(owner);
        uint256 id = tm.createTeam();

        vm.prank(user1);
        vm.expectRevert();  
        tm.inviteUser(id, user2);
    }

    function testInvitedUserCanAccept() public {
        vm.prank(owner);
        uint256 id = tm.createTeam();

        // invite
        vm.prank(owner);
        tm.inviteUser(id, user1);

        // accept
        vm.prank(user1);
        tm.acceptInvite(id);

        assertEq(tm.pendingInvites(id, user1), false);
    }

    function testUninvitedUserCannotAccept() public {
        vm.prank(owner);
        uint256 id = tm.createTeam();

        vm.prank(user1);
        vm.expectRevert();
        tm.acceptInvite(id);
    }

    function testOwnerCanRemove() public {
        vm.prank(owner);
        uint256 id = tm.createTeam();

        vm.prank(owner);
        tm.inviteUser(id, user1);

        vm.prank(user1);
        tm.acceptInvite(id);

        vm.prank(owner);
        tm.removeMember(id, user1);

        // No revert = success for now
    }

    function testNonOwnerCannotRemove() public {
        vm.prank(owner);
        uint256 id = tm.createTeam();

        vm.prank(owner);
        tm.inviteUser(id, user1);

        vm.prank(user1);
        tm.acceptInvite(id);

        vm.prank(user1);
        vm.expectRevert();
        tm.removeMember(id, user1);
    }
}