import { open } from "fs/promises";

const databaseFilePath = process.argv[2];
const command = process.argv[3];

if (command === ".dbinfo") {
  const databaseFileHandler = await open(databaseFilePath, "r");

  const { buffer } = await databaseFileHandler.read({
    length: 100,
    position: 0,
    buffer: Buffer.alloc(100),
  });

  let offset = 0;

  const headerString = Buffer.from(buffer.subarray(0, offset + 16).toString());
  // console.log(headerString.toString()); // SQLITE FORMAT 3
  offset += 16

  const databaseSize = buffer.subarray(offset, offset + 2);
  offset += 2

  console.log("database page size: ", databaseSize.readUInt16BE())

} else {
  throw `Unknown command ${command}`;
}
