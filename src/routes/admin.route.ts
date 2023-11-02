import { Router } from 'express';
import * as admin from '@/controllers/admin.controller';
import * as user from "@/controllers/user.controller";
import * as artist from "@/controllers/artist.controller";

const router = Router();

/**
 *  admin
 */

router.post('/admin/register', admin.Admin_signUp);
router.post('/admin/login', admin.Admin_signIn);

router.get('/admin',admin.getAllAdmin);
router.get('/admin/:id',admin.getAdminById);

router.get('/admin/logOut',admin.logOut);


/**
 * Get All Users
 */
router.get('/user', user.getAllUsers);
/**
 * Get User by ID
 */
router.get('/user/:user_id', user.getUserById);
/**
 * Update User by ID
 */
router.get('/user/:user_id', user.getUserById);
/**
 * Delet User by ID
 */
router.delete('/user/:user_id', user.deleteUserById);


/**
 * Get All artist
 */
router.get('/artist', artist.getAllartists);
/**
  * Update artist by ID
 */
router.get('/artist/:name', artist.getartistByName);
/**
 * Delet artist by ID
 */
router.delete('/artist/:artist_id', artist.deleteartistById);




export default router;