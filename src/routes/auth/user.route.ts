import { Router } from 'express';
import * as user from '@/controllers/user.controller';

const router = Router();

/**
 * Sign Up User
 */

router.post('/user/register', user.signUp);
/**
 * Confirm User OTP
 */
router.post('/user/confirm-otp', user.confirmOTP);
/**
 * Sign In User
 */
router.post('/user/login', user.signIn);

/**
 * Forgot Password
 */
router.post('/user/forgot-password', user.forgetPassword);
/**
 * Reset Password
 */
router.post('/user/reset-password', user.resetPassword);
/**
 * Log Out
 * */
router.post('/user/logout', user.logOut);


export default router;
