import { Router } from "express";
import { AccountManager } from "./Account.js";
import { ApiService } from "./ApiService.js";
// import { MikrotikApi } from "./MikrotikApi.js";
export const router = Router();
router.use("/AccountManager", AccountManager);
router.use("/ApiService", ApiService);
// router.use("/MikrotikApi", MikrotikApi);
