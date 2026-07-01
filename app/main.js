import { open } from "fs/promises";

const databaseFilePath = process.argv[2];
const command = process.argv[3];
const databaseFileHandler = await open(databaseFilePath, "r");

const handleFileInfo = async (databaseFileHandler) => {
  try {
    const { buffer } = await databaseFileHandler.read({
      length: 100,
      position: 0,
      buffer: Buffer.alloc(100),
    });

    let offset = 0;

    const headerString = buffer.toString("utf8", 0, 16);
    offset += 16

    const pageSize = buffer.readUInt16BE(offset);
    offset += 2

    console.log("database page size:", pageSize)


    const firstPage = Buffer.alloc(pageSize);
    // console.log(firstPage.length === pageSize)

    await databaseFileHandler.read({
      buffer: firstPage,
      offset: 0,
      length: pageSize,
      position: 0
    });

    // console.log(firstPage);

    // we are skipping 100 because the first 100 bytes in the first page is the file header which has been 
    // read above. For ANY OTHER PAGES THIS WILL BE 0 which I presume I'll need in the next steps?
    const btreeHeaderOffset = 100;

    // we read one byte because that's how we are defining the btree type - 4 types are present from the docs.
    // a value of 0a or 0d mean leaf page. I am ignoring others since I am keeping this constrainted to just 
    // one page btree database sqlite file.
    const btreePageType = firstPage.readUInt8(btreeHeaderOffset);

    // why do we do a 16 here? What if we didn't? Or used utf-8 instead? Is it because we are storing hex values?
    // So if we didn't do that, I can see the output for below log as 13 which is just int of 0x0d, so 
    // it seems we are converting it from int to hex.
    // console.log("btree page type:", btreePageType.toString());

    // from the docs -> The two-byte integer at offset 3 gives the number of cells on the page.
    // docs -> https://www.sqlite.org/fileformat2.html#ffschema
    const cellCount = firstPage.readUInt16BE(btreeHeaderOffset + 3);

    // this is slightly inaccurate but keeping it since it's required to pass the stage.
    // this is everything, indices, etc.
    console.log("number of tables:", cellCount);
  } catch (err) {
    console.log(err);
  } finally {
    await databaseFileHandler.close()
  }
}

if (command === ".dbinfo") {
  handleFileInfo(databaseFileHandler)
} else {
  throw `Unknown command ${command}`;
}