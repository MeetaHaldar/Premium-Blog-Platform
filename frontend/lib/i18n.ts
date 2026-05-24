// Minimal i18n — English + Chinese
export type Locale = 'en' | 'zh';

export const translations = {
  en: {
    nav: {
      blogs: 'Blogs',
      dashboard: 'Dashboard',
      profile: 'My Profile',
      myBlogs: 'My Blogs',
      admin: 'Admin',
      login: 'Login',
      signup: 'Sign Up',
      logout: 'Logout'
    },
    home: {
      hero: 'Premium Blog Platform',
      heroSub: 'Discover, read, and share premium content from expert writers',
      exploreBlogs: 'Explore Blogs',
      getStarted: 'Get Started',
      whyUs: 'Why Choose Us',
      quality: 'Quality Content',
      qualitySub: 'Access premium blogs from expert writers across various topics',
      secure: 'Secure & Safe',
      secureSub: 'Your data is encrypted and protected with industry-standard security',
      community: 'Community Driven',
      communitySub: 'Like, share, and engage with a community of avid readers',
      cta: 'Ready to Start Reading?',
      ctaSub: 'Join thousands of readers enjoying premium content',
      createAccount: 'Create Free Account'
    },
    blogs: {
      title: 'Explore Blogs',
      search: 'Search blogs...',
      noBlogs: 'No blogs found.',
      readMore: 'Read More →',
      premium: 'Premium',
      previous: 'Previous',
      next: 'Next',
      page: 'Page'
    },
    blog: {
      buyNow: 'Buy Now',
      premiumArticle: 'Premium Article',
      unlockFull: 'Unlock the full article with a one-time purchase via Stripe.',
      fullAccess: 'Full article access',
      oneTime: 'One-time payment',
      lifetime: 'Lifetime access',
      signInToBuy: 'Sign in to purchase this article',
      redirecting: 'Redirecting to Stripe...',
      notFound: 'Blog not found',
      browseAll: 'Browse all blogs'
    },
    auth: {
      createAccount: 'Create Account',
      signIn: 'Sign In',
      fullName: 'Full Name',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      alreadyHave: 'Already have an account?',
      noAccount: "Don't have an account?",
      forgotPassword: 'Forgot Password?',
      verifyEmail: 'Verify Email',
      otpSent: 'We sent a 6-digit code to',
      otpCode: 'OTP Code',
      verify: 'Verify OTP',
      resend: 'Resend OTP'
    }
  },
  zh: {
    nav: {
      blogs: '博客',
      dashboard: '仪表板',
      profile: '我的资料',
      myBlogs: '我的博客',
      admin: '管理员',
      login: '登录',
      signup: '注册',
      logout: '退出'
    },
    home: {
      hero: '高级博客平台',
      heroSub: '发现、阅读并分享专家作者的优质内容',
      exploreBlogs: '探索博客',
      getStarted: '开始使用',
      whyUs: '为什么选择我们',
      quality: '优质内容',
      qualitySub: '访问各类主题专家作者的高级博客',
      secure: '安全可靠',
      secureSub: '您的数据经过加密，受到行业标准安全保护',
      community: '社区驱动',
      communitySub: '点赞、分享并与热心读者社区互动',
      cta: '准备好开始阅读了吗？',
      ctaSub: '加入数千名享受优质内容的读者',
      createAccount: '免费创建账户'
    },
    blogs: {
      title: '探索博客',
      search: '搜索博客...',
      noBlogs: '未找到博客。',
      readMore: '阅读更多 →',
      premium: '高级',
      previous: '上一页',
      next: '下一页',
      page: '第'
    },
    blog: {
      buyNow: '立即购买',
      premiumArticle: '高级文章',
      unlockFull: '通过 Stripe 一次性购买解锁完整文章。',
      fullAccess: '完整文章访问',
      oneTime: '一次性付款',
      lifetime: '终身访问',
      signInToBuy: '登录后购买此文章',
      redirecting: '正在跳转到 Stripe...',
      notFound: '未找到博客',
      browseAll: '浏览所有博客'
    },
    auth: {
      createAccount: '创建账户',
      signIn: '登录',
      fullName: '全名',
      email: '邮箱',
      password: '密码',
      confirmPassword: '确认密码',
      alreadyHave: '已有账户？',
      noAccount: '没有账户？',
      forgotPassword: '忘记密码？',
      verifyEmail: '验证邮箱',
      otpSent: '我们已向以下地址发送了6位验证码',
      otpCode: '验证码',
      verify: '验证',
      resend: '重新发送'
    }
  }
} as const;

export type TranslationKeys = typeof translations.en;
