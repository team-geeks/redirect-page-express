var express = require("express");
var router = express.Router();

const { body, check, validationResult } = require("express-validator");
const { validateTxn, runValidation } = require("../validate/validateTransaction");
/*var mid = '19010';
var username = '1021705';
var password = '74b1K5k2';
var secret = 'P43WoR9jcQkB7UOh';*/
var mid = "21720";
var username = "7595201";
var password = "MgUFY5em";
var secret = "6KeetYvu2TSdsegD";

var now = new Date();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/txn", function (req, res, next) {
  res.render("txn", { title: "Express" });
});

router.post(
  "/sendtoairpay",
  [
    //first name
    check("buyerFirstName", "First Name is required")
      .not()
      .isEmpty()
      .isLength({ min: 3 })
      .withMessage("The name must have minimum length of 3")
      .isLength({ max: 50 })
      .withMessage("The name must have maximum length of 5")
      .custom((value) => {
        var pnValdiate = /^[A-Za-z]+$/;
        if (!pnValdiate.test(value)) {
          throw new Error("Invalid first name");
        } else return true;
      })
      .trim(),
    //last name
    check("buyerLastName", "Last Name is required")
      .not()
      .isEmpty()
      .isLength({ max: 50 })
      .withMessage("The last name must have maximum length of 5")
      .custom((value) => {
        var pnValdiate = /^[A-Za-z]+$/;
        if (!pnValdiate.test(value)) {
          throw new Error("Invalid last name");
        } else return true;
      })
      .trim(),
    //phone no
    check("buyerPhone", "Phone no is required")
      .isLength({ min: 1 })
      .custom((value) => {
        var pnValdiate = /^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/;
        if (!pnValdiate.test(value)) {
          throw new Error("Invalid format");
        } else return true;
      })
      .trim(),
    //amount ^[1-9]{1}[0-9]{2}\s{0,1}[0-9]{3}$
    check("amount", "Amount is required").not().isEmpty().isNumeric().trim(),
    //email
    check("buyerEmail").isEmail().withMessage("Invalid email address").normalizeEmail(),
    //currency
    check("currency", "Currency is required")
      .isLength({ min: 1 })

      .trim(),
    //isocurrency
    check("isocurrency", "ISO currency is required")
      .not()
      .isEmpty()
      .isLength({ max: 3, min: 3 })
      .withMessage("ISO currency must have a length of 3")
      .custom((value) => {
        var pnValdiate = /^[A-Za-z]+$/;
        if (!pnValdiate.test(value)) {
          throw new Error("Invalid format");
        } else return true;
      })

      .trim(),
    //order id
    check("orderid", "Orderid is required").isLength({ min: 1 }).trim(),
    //pin
    check("buyerPinCode")
      .custom((value) => {
        var pnValdiate = /^[1-9]{1}[0-9]{2}\s{0,1}[0-9]{3}$/;
        if (value != "" && !pnValdiate.test(value)) {
          throw new Error("Invalid format");
        } else return true;
      })
      .trim(),
    // // check("txnsubtype")
    // // .isNumeric()
    // // .withMessage("Invalid subtype")
    // // .trim(),
    // check("arpyVer",'A numeric type version is required!')
    // .not().isEmpty()
    // .isNumeric()
    // .trim(),
  ],
  runValidation,
  function (req, res, next) {
    var md5 = require("md5");
    var sha256 = require("sha256");
    var dateformat = require("dateformat");
    alldata =
      req.body.buyerEmail +
      req.body.buyerFirstName +
      req.body.buyerLastName +
      req.body.buyerAddress +
      req.body.buyerCity +9
      req.body.buyerState +
      req.body.buyerCountry +
      req.body.amount +
      req.body.orderid;
    udata = username + ":|:" + password;
    privatekey = sha256(secret + "@" + udata);
    keySha256 = sha256(username + "~:~" + password);
    aldata = alldata + dateformat(now, "yyyy-mm-dd");
    checksum = sha256(keySha256 + "@" + aldata); //md5(aldata+privatekey);
    fdata = req.body;

    res.render("sendtoairpay", { mid: mid, data: fdata, privatekey: privatekey, checksum: checksum });
  }
);

router.post("/airpay/recharge/succr/succ/ok", function (req, res, next) {
  var CRC32 = require("crc-32");
  console.log("REques -> ", req);
  console.log("REquest body -> ", req.body);
  console.log("REquest body 2 -> ", req.files);
  var txnhash = CRC32.str(
    req.body.TRANSACTIONID +
      ":" +
      req.body.APTRANSACTIONID +
      ":" +
      req.body.AMOUNT +
      ":" +
      req.body.TRANSACTIONSTATUS +
      ":" +
      req.body.MESSAGE +
      ":" +
      mid +
      ":" +
      username
  );

  var chmod = req.body.CHMOD;
  var custmvar = req.body.CUSTOMERVPA;
  if (chmod === "upi") {
    txnhash = CRC32.str(
      req.body.TRANSACTIONID +
        ":" +
        req.body.APTRANSACTIONID +
        ":" +
        req.body.AMOUNT +
        ":" +
        req.body.TRANSACTIONSTATUS +
        ":" +
        req.body.MESSAGE +
        ":" +
        mid +
        ":" +
        username +
        ":" +
        custmvar
    );
  }
  txnhash = txnhash >>> 0;
  txndata = req.body;
  console.log(txndata.ap_SecureHash);
  console.log(txnhash);

  res.render("response", { txnhash: txnhash, txndata: txndata });
});

router.post("/airpay/webhook", function (req, res, next) {
  console.log("Response from airpay webhook -> ", req)
});

module.exports = router;
