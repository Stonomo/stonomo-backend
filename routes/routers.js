import { router as loginRouter } from './loginRoutes.js';
import { router as passwordRouter } from './passwordRoutes.js'
import { router as userRouter } from './userRoutes.js';
import { router as reasonRouter } from './reasonRoutes.js';
import { router as evictionRouter } from './evictionRoutes.js';
import { router as searchRouter } from './searchRoutes.js'
import { router as testClientRouter } from './testClientRoutes.js';

export default { evictionRouter, loginRouter, passwordRouter, reasonRouter, searchRouter, testClientRouter, userRouter }