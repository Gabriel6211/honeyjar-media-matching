import { Router } from "express";
import { validateSearchBody } from "../middleware/validate.js";
import { handleSearch } from "../controllers/search.js";

const router = Router();

router.post("/", validateSearchBody, handleSearch);

export default router;
