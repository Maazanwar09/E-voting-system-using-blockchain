import { ethers } from "hardhat";

async function main() {
  const [admin, voter1, voter2, voter3, voter4, voter5] = await ethers.getSigners();
  const contractAddress = "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6";
  
  console.log("Connecting to Voting contract at:", contractAddress);
  const voting = await ethers.getContractAt("Voting", contractAddress);

  console.log("--- Creating Test Election ---");
  const startTime = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
  const endTime = startTime + (3600 * 48); // 48 hours from now
  
  const tx1 = await voting.createElection(
    "University Presidential Election 2024",
    "Official voting for the next Student Union President. Every vote counts!",
    startTime,
    endTime
  );
  await tx1.wait();
  console.log("Election created!");

  console.log("--- Adding Candidates ---");
  const candidates = [
    { name: "Alice Johnson", details: "Computer Science Junior", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice" },
    { name: "Bob Smith", details: "Economics Senior", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob" },
    { name: "Charlie Davis", details: "Arts & Design Sophomore", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie" }
  ];

  for (const c of candidates) {
    const tx = await voting.addCandidate(1, c.name, c.details, c.img);
    await tx.wait();
    console.log(`Added candidate: ${c.name}`);
  }

  console.log("--- Whitelisting Voters & Casting Initial Votes ---");
  await voting.whitelistVoter(voter1.address);
  await voting.whitelistVoter(voter2.address);
  await voting.whitelistVoter(voter3.address);
  await voting.whitelistVoter(voter4.address);
  await voting.whitelistVoter(voter5.address);

  // Casting some votes from different accounts
  await voting.connect(voter1).vote(1, 1); // Alice
  await voting.connect(voter2).vote(1, 1); // Alice
  await voting.connect(voter3).vote(1, 2); // Bob
  await voting.connect(voter4).vote(1, 2); // Bob
  await voting.connect(voter5).vote(1, 1); // Alice

  console.log("Votes cast successfully!");
  console.log("====================================");
  console.log("Setup Complete! You can now view the Results Page.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
