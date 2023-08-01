"use strict";

const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("../expressError");
const {
  authenticateJWT,
  ensureLoggedIn,
  is_Admin,
  isUserOrAdmin,
} = require("./auth");


const { SECRET_KEY } = require("../config");
const testJwt = jwt.sign({ username: "test", isAdmin: false }, SECRET_KEY);
const badJwt = jwt.sign({ username: "test", isAdmin: false }, "wrong");


describe("authenticateJWT", function () {
  test("works: via header", function () {
    expect.assertions(2);
     //there are multiple ways to pass an authorization token, this is how you pass it in the header.
    //this has been provided to show you another way to pass the token. you are only expected to read this code for this project.
    const req = { headers: { authorization: `Bearer ${testJwt}` } };
    const res = { locals: {} };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({
      user: {
        iat: expect.any(Number),
        username: "test",
        isAdmin: false,
      },
    });
  });

  test("works: no header", function () {
    expect.assertions(2);
    const req = {};
    const res = { locals: {} };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });

  test("works: invalid token", function () {
    expect.assertions(2);
    const req = { headers: { authorization: `Bearer ${badJwt}` } };
    const res = { locals: {} };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });
});


describe("ensureLoggedIn", function () {
  test("works", function () {
    expect.assertions(1);
    const req = {};
    const res = { locals: { user: { username: "test", is_admin: false } } };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    ensureLoggedIn(req, res, next);
  });

  test("unauth if no login", function () {
    expect.assertions(1);
    const req = {};
    const res = { locals: {} };
    const next = function (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };
    ensureLoggedIn(req, res, next);
  });
});

describe("is_Admin", function () {
  test("works: user is an admin", function () {
    const req = { params: { username: "adminUser" } }; // Set the params object with the username
    const res = { locals: { user: { username: "adminUser", isAdmin: true } } };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    isUserOrAdmin(req, res, next);
  });

  test("unauth: user is not an admin", function () {
    const req = {};
    const res = { locals: { user: { username: "regularUser", isAdmin: false } } };
    const next = function (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };
    is_Admin(req, res, next);
  });

  test("unauth: user is not authenticated", function () {
    const req = {};
    const res = { locals: {} };
    const next = function (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };
    is_Admin(req, res, next);
  });
});

describe("isUserOrAdmin", function () {
  test("works: user is an admin", function () {
    const req = { params : { username : "adminUser" }};
    const res = { locals: { user: { username: "adminUser", isAdmin: true } } };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    isUserOrAdmin(req, res, next);
  });

  test("works: user is the owner of the resource", function () {
    const req = { params: { username: "resourceOwner" } };
    const res = { locals: { user: { username: "resourceOwner", isAdmin: false } } };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    isUserOrAdmin(req, res, next);
  });

  test("unauth: user is not the owner of the resource", function () {
    const req = { params: { username: "otherUser" } };
    const res = { locals: { user: { username: "resourceOwner", isAdmin: false } } };
    const next = function (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };
    isUserOrAdmin(req, res, next);
  });

  test("unauth: user is not authenticated", function () {
    const req = { params: { username: "resourceOwner" } };
    const res = { locals: {} };
    const next = function (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };
    isUserOrAdmin(req, res, next);
  });
});
