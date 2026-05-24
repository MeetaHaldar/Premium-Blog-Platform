import express from 'express';
import * as blogController from '../controllers/blogController';
import { auth, optionalAuth } from '../middleware/auth';

const router = express.Router();

router.get('/', optionalAuth, blogController.getAllBlogs);
router.get('/my-blogs', auth, blogController.getMyBlogs);  // must be before /:slug
router.post('/', auth, blogController.createBlog);
router.post('/:blogId/like', auth, blogController.toggleBlogLike);
router.get('/:slug', optionalAuth, blogController.getBlogBySlug);
router.put('/:id', auth, blogController.updateBlog);
router.delete('/:id', auth, blogController.deleteBlog);

export default router;
