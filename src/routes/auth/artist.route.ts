import { Router } from 'express';
import * as artist from '@/controllers/artist.controller';

const router = Router();

/**
 * Sign Up artist
 */

router.post('/artist/register', artist.signUp);
/**
 * Confirm artist OTP
 */
router.post('/artist/confirm-otp', artist.confirmOTP);
/**
 * Sign In artist
 */
router.post('/artist/login', artist.signIn);

/**
 * Forgot Password
 */
router.post('/artist/forgot-password', artist.forgetPassword);
/**
 * Reset Password
 */
router.post('/artist/reset-password', artist.resetPassword);
/**
 * Log Out
 * */
router.post('/artist/logout', artist.logOut);


router.put('/follower', artist.follower)

export default router;
