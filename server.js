const express = require("express");
const fetch = require("node-fetch");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Fit Store payment server is working");
});

app.get("/pay", async (req, res) => {
  try {
    const amount = Number(req.query.amount || 100);

    const response = await fetch("https://api.monobank.ua/api/merchant/invoice/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Token": process.env.MONO_TOKEN
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100),
        ccy: 980,
        merchantPaymInfo: {
          reference: "fitstore_order_" + Date.now(),
          destination: "Оплата замовлення Fit Store"
        },
        redirectUrl: "https://fitstore.odesa.ua/thank-you",
        webHookUrl: "https://fitstore-pay.onrender.com/mono-webhook"
      })
    });

    const data = await response.json();

    if (!data.pageUrl) {
      return res.status(500).send("Mono error: " + JSON.stringify(data));
    }

    res.redirect(data.pageUrl);
  } catch (err) {
    res.status(500).send("Server error: " + err.message);
  }
});

app.post("/mono-webhook", (req, res) => {
  console.log("Mono webhook:", req.body);
  res.sendStatus(200);
});

app.post("/tilda", (req, res) => {
  console.log("Tilda order:", req.body);
  res.sendStatus(200);
});

app.listen(process.env.PORT || 3000);
