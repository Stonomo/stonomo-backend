import { router as rootRouter } from './rootRoutes.js';
import { router as passwordRouter } from './passwordRoutes.js'
import { router as userRouter } from './userRoutes.js';
import { router as reasonRouter } from './reasonRoutes.js';
import { router as evictionRouter } from './evictionRoutes.js';
import { router as searchRouter } from './searchRoutes.js'
import { router as adminRouter } from './adminRoutes.js';

export default { evictionRouter, rootRouter, passwordRouter, reasonRouter, searchRouter, adminRouter, userRouter }