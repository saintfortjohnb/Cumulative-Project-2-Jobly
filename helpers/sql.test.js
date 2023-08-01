// test/helpers/sql.test.js

const { sqlForPartialUpdate } = require("../helpers/sql");
const { BadRequestError } = require("../expressError");

describe("sqlForPartialUpdate", () => {
  it("should generate SQL query for partial update", () => {
    const dataToUpdate = { firstName: "Aliya", age: 32 };
    const jsToSql = { firstName: "first_name", age: "age" };

    const result = sqlForPartialUpdate(dataToUpdate, jsToSql);

    const expectedQuery = '"first_name"=$1, "age"=$2';
    const expectedValues = ["Aliya", 32];
    expect(result.setCols).toEqual(expectedQuery);
    expect(result.values).toEqual(expectedValues);
  });

  it("should throw BadRequestError when dataToUpdate is an empty object", () => {
    const dataToUpdate = {};
    const jsToSql = { firstName: "first_name", age: "age" };

    try {
      sqlForPartialUpdate(dataToUpdate, jsToSql);
      fail("Expected BadRequestError to be thrown");
    } catch (err) {
      expect(err instanceof BadRequestError).toBe(true);
      expect(err.message).toBe("No data");
    }
  });
});
