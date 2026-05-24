import { Request, Response, NextFunction } from 'express';
import Blog from '../models/Blog';
import User from '../models/User';

export const createBlog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, description, content, featuredImage, language, status, isPremium, price } = req.body;
    const userId = (req as any).user.id;

    // Fetch author info at creation time and denormalize it onto the blog
    const author = await User.findById(userId).select('name avatar');
    if (!author) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const blog = new Blog({
      title, description, content, featuredImage, language, status,
      createdBy: userId,
      authorName: author.name,
      authorAvatar: author.avatar || '',
      isPremium,
      price: isPremium ? price : 0
    });

    await blog.save();
    res.status(201).json({ success: true, message: 'Blog created successfully', blog });
  } catch (error) {
    next(error);
  }
};

export const getAllBlogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = 1, limit = 10, status = 'published', search } = req.query;
    const userId = (req as any).user?.id;
    const query: any = { status };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const rawBlogs = await Blog.find(query).lean().skip(skip).limit(Number(limit)).sort({ createdAt: -1 });
    const total = await Blog.countDocuments(query);

    // For blogs that have denormalized authorName, use it directly.
    // For older blogs without it, fall back to a user lookup.
    const missingAuthorIds = [...new Set(
      rawBlogs
        .filter((b: any) => !b.authorName && b.createdBy)
        .map((b: any) => b.createdBy.toString())
    )];

    const fallbackMap = new Map<string, { name: string; avatar: string }>();
    if (missingAuthorIds.length > 0) {
      const users = await User.find({ _id: { $in: missingAuthorIds } }).select('name avatar').lean();
      users.forEach((u: any) => fallbackMap.set(u._id.toString(), { name: u.name, avatar: u.avatar || '' }));
    }

    const blogs = rawBlogs.map((blog: any) => {
      // Use denormalized name if available, otherwise look up from DB
      const fallback = fallbackMap.get(blog.createdBy?.toString());
      const name = blog.authorName || fallback?.name || 'Unknown';
      const avatar = blog.authorAvatar || fallback?.avatar || '';

      return {
        ...blog,
        createdBy: {
          _id: blog.createdBy,
          name,
          avatar
        },
        isLiked: userId
          ? (blog.likedBy || []).some((id: any) => id.toString() === userId)
          : false
      };
    });

    res.status(200).json({
      success: true,
      blogs,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) }
    });
  } catch (error) {
    next(error);
  }
};

export const getBlogBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { slug } = req.params;
    const userId = (req as any).user?.id;
    const rawBlog = await Blog.findOne({ slug }).lean() as any;
    if (!rawBlog) {
      res.status(404).json({ success: false, message: 'Blog not found' });
      return;
    }

    // Use denormalized author fields if present, otherwise look up
    let authorName = rawBlog.authorName;
    let authorAvatar = rawBlog.authorAvatar || '';
    let authorId = rawBlog.createdBy?.toString();

    if (!authorName && rawBlog.createdBy) {
      const author = await User.findById(rawBlog.createdBy).select('name avatar').lean() as any;
      if (author) {
        authorName = author.name;
        authorAvatar = author.avatar || '';
        authorId = author._id.toString();
      }
    }

    const blog = {
      ...rawBlog,
      createdBy: {
        _id: rawBlog.createdBy,
        name: authorName || 'Unknown',
        avatar: authorAvatar
      }
    };

    let hasPurchased = false;
    if (userId) {
      const user = await User.findById(userId);
      const blogId = rawBlog._id.toString();
      hasPurchased =
        user?.purchasedBlogs.some(id => id.toString() === blogId) ||
        authorId === userId;
    }

    res.status(200).json({ success: true, blog, hasPurchased });
  } catch (error) {
    next(error);
  }
};

export const updateBlog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    let blog = await Blog.findById(id);
    if (!blog) {
      res.status(404).json({ success: false, message: 'Blog not found' });
      return;
    }
    if (blog.createdBy.toString() !== userId && (req as any).user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }
    blog = await Blog.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json({ success: true, message: 'Blog updated successfully', blog });
  } catch (error) {
    next(error);
  }
};

export const deleteBlog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const blog = await Blog.findById(id);
    if (!blog) {
      res.status(404).json({ success: false, message: 'Blog not found' });
      return;
    }
    if (blog.createdBy.toString() !== userId && (req as any).user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }
    await Blog.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Blog deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const toggleBlogLike = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { blogId } = req.params;
    const userId = (req as any).user.id;
    const blog = await Blog.findById(blogId);
    const user = await User.findById(userId);
    if (!blog || !user) {
      res.status(404).json({ success: false, message: 'Blog or user not found' });
      return;
    }
    const isLiked = blog.likedBy.some(id => id.toString() === userId);
    if (isLiked) {
      blog.likedBy = blog.likedBy.filter(id => id.toString() !== userId);
      blog.likesCount -= 1;
      user.likedBlogs = user.likedBlogs.filter(id => id.toString() !== blogId);
    } else {
      blog.likedBy.push(userId as any);
      blog.likesCount += 1;
      user.likedBlogs.push(blogId as any);
    }
    await blog.save();
    await user.save();
    res.status(200).json({
      success: true,
      message: isLiked ? 'Blog unliked' : 'Blog liked',
      isLiked: !isLiked,
      likesCount: blog.likesCount
    });
  } catch (error) {
    next(error);
  }
};

export const getMyBlogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const blogs = await Blog.find({ createdBy: userId }).skip(skip).limit(Number(limit)).sort({ createdAt: -1 });
    const total = await Blog.countDocuments({ createdBy: userId });
    res.status(200).json({ success: true, blogs, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) } });
  } catch (error) {
    next(error);
  }
};
