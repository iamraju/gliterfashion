import { Router } from "express";
import { CategoriesController } from "./categories.controller";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { upload } from "../../middleware/upload.middleware";

const router = Router();
const categoriesController = new CategoriesController();

router.use(authenticate);

// Public-ish (Authenticated Users)
router.get("/", categoriesController.getAllCategories);
router.get("/:id", categoriesController.getCategory);

// Admin Only
router.post(
  "/",
  authorize(["SUPER_ADMIN"]),
  upload.single("image"),
  categoriesController.createCategory
);
router.patch(
  "/:id",
  authorize(["SUPER_ADMIN"]),
  upload.single("image"),
  categoriesController.updateCategory
);
router.delete(
  "/:id",
  authorize(["SUPER_ADMIN"]),
  categoriesController.deleteCategory
);

export default router;
