const chai = require("chai");
const chaiHttp = require("chai-http");
const { app } = require("../app");
const expect = chai.expect;

const User = require("../models/user");
const Check = require("../models/check");

chai.should();
chai.use(chaiHttp);

describe(`api`, () => {
  it("going into any unspecified path should return 404", async () => {
    const request = await chai.request(app).get("/");
    expect(request.status).to.equal(404);
  });
});

describe("checks", function () {
  this.timeout(10000);
  let userId;
  let agent = chai.request.agent(app);
  before(async () => {
    const request = await agent
      .post("/auth/register")

      .set("content-type", "application/json")
      .send({
        email: "mohamed@test2.test",
        password: "testing1234",
      });
    request.should.have.status(201);
    userId = request.body.user.id;
  });
  let checkId;
  it("create check", async () => {
    const request = await agent
      .post("/check")
      .set("content-type", "application/json")
      .send({
        linkText: "http://google.com",
        name: "testing",
      });
    request.should.have.status(201);
    checkId = request.body.newCheck._id;

    after(async () => {
      await Check.deleteOne({ _id: checkId });
    });
  });
  it("edit check", async () => {
    const newName = "new name";
    const request = await agent
      .patch(`/check/${checkId}`)
      .set("content-type", "application/json")
      .send({
        name: newName,
      });

    request.should.have.status(200);
    request.body.editedCheck.name.should.eql(newName);
  });
  it("pause check", async () => {
    const request = await agent.post(`/check/pause/${checkId}`);
    request.should.have.status(200);
  });
  it("resume check", async () => {
    const request = await agent.post(`/check/resume/${checkId}`);
    request.should.have.status(200);
  });
  it("delete check", async () => {
    const request = await agent.delete(`/check/${checkId}`);
    request.should.have.status(200);
  });
  it("creating a check with invalid url should return 400", async () => {
    const request = await agent
      .post("/check")
      .set("content-type", "application/json")
      .send({
        linkText: "notvalid@url",
        name: "testing",
      });
    request.should.have.status(400);
  });

  after(async () => {
    await User.deleteOne({ _id: userId });
  });
});
