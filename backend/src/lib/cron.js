import cron from "cron";
import e from "express";
import https from "https";

const job = new cron.CronJob("*/14 * * * *", function () {
    https
    .get(process.env.API_URL, (res) => {
        if (res.statusCode === 200) console.log("La richiesta GET è stata inviata con successo");
        else console.log("Richiesta GET fallita", res.statusCode);
    })
    .on("error", (e) => console.error("Errore durante l'invio della richiesta", e));
})

export default job;