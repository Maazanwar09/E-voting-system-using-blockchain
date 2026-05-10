// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Voting {
    struct Candidate {
        uint256 id;
        string name;
        string details;
        string imageUrl;
        uint256 voteCount;
    }

    struct Election {
        uint256 id;
        string title;
        string description;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        uint256 candidateCount;
    }

    address public admin;
    uint256 public electionCount;
    mapping(uint256 => Election) public elections;
    
    // electionId => (candidateId => Candidate)
    mapping(uint256 => mapping(uint256 => Candidate)) public electionCandidates;
    
    // electionId => (voterAddress => bool)
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    event ElectionCreated(uint256 electionId, string title);
    event CandidateAdded(uint256 electionId, uint256 candidateId, string name);
    event Voted(uint256 electionId, address voter, uint256 candidateId);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function createElection(string memory _title, string memory _description, uint256 _startTime, uint256 _endTime) public onlyAdmin {
        require(_endTime > _startTime, "End time must be after start time");
        
        electionCount++;
        elections[electionCount] = Election(electionCount, _title, _description, _startTime, _endTime, true, 0);
        
        emit ElectionCreated(electionCount, _title);
    }

    function addCandidate(uint256 _electionId, string memory _name, string memory _details, string memory _imageUrl) public onlyAdmin {
        require(_electionId > 0 && _electionId <= electionCount, "Invalid election ID");
        
        elections[_electionId].candidateCount++;
        uint256 newCandidateId = elections[_electionId].candidateCount;
        
        electionCandidates[_electionId][newCandidateId] = Candidate(newCandidateId, _name, _details, _imageUrl, 0);
        
        emit CandidateAdded(_electionId, newCandidateId, _name);
    }

    function vote(uint256 _electionId, uint256 _candidateId) public {
        require(_electionId > 0 && _electionId <= electionCount, "Invalid election ID");
        Election memory e = elections[_electionId];
        require(block.timestamp >= e.startTime, "Election has not started");
        require(block.timestamp <= e.endTime, "Election has ended");
        require(!hasVoted[_electionId][msg.sender], "You have already voted in this election");
        require(_candidateId > 0 && _candidateId <= e.candidateCount, "Invalid candidate ID");

        hasVoted[_electionId][msg.sender] = true;
        electionCandidates[_electionId][_candidateId].voteCount++;

        emit Voted(_electionId, msg.sender, _candidateId);
    }

    function getCandidate(uint256 _electionId, uint256 _candidateId) public view returns (Candidate memory) {
        return electionCandidates[_electionId][_candidateId];
    }
    
    function getAllCandidates(uint256 _electionId) public view returns (Candidate[] memory) {
        uint256 count = elections[_electionId].candidateCount;
        Candidate[] memory _candidates = new Candidate[](count);
        for (uint256 i = 1; i <= count; i++) {
            _candidates[i - 1] = electionCandidates[_electionId][i];
        }
        return _candidates;
    }

    function getElection(uint256 _electionId) public view returns (Election memory) {
        return elections[_electionId];
    }
}
