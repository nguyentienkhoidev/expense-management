import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// English translations
const en = {
  translation: {
    // General
    cancel: 'Cancel',
    save: 'Save',
    create: 'Create',
    delete: 'Delete',
    edit: 'Edit',
    success: 'Success',
    error: 'Error',
    loading: 'Loading...',
    confirm: 'Confirm',
    selectCategory: 'Select category',
    selectWallet: 'Select wallet',
    newCategory: '+ New',
    noData: 'No data',
    income: 'Income',
    expense: 'Expense',
    exportCSV: 'Export CSV',
    searchTransactions: 'Search transactions...',
    filters: 'Filters',
    allTypes: 'All Types',
    previous: 'Previous',
    next: 'Next',
    colors: {
      blue: 'Blue',
      emerald: 'Emerald',
      purple: 'Purple',
      orange: 'Orange',
      rose: 'Rose'
    },

    // Auth
    auth: {
      appName: 'Finova',
      signIn: 'Sign In',
      signUp: 'Sign up',
      createAccount: 'Create Account',
      username: 'Username',
      email: 'Email',
      password: 'Password',
      forgot: 'Forgot?',
      enterUsername: 'Enter your username',
      enterEmail: 'Enter your email',
      noAccount: "Don't have an account? ",
      hasAccount: 'Already have an account? ',
      loginSubtitle: 'Enter your credentials to access your account',
      registerSubtitle: 'Create an account to start tracking expenses',
      twoFASubtitle: 'Enter your 2FA code to continue',
      authCode: 'Authentication Code',
      verifyCode: 'Verify Code',
      errorOccurred: 'An error occurred',
      // Forgot Password
      resetPassword: 'Reset Password',
      forgotSubtitle: 'Enter your email address and we\'ll send you a link to reset your password.',
      emailAddress: 'Email Address',
      sendResetLink: 'Send Reset Link',
      backToLogin: 'Back to Login',
      checkEmail: 'Check your email',
      resetLinkSent: 'We have sent a password reset link to',
      returnToLogin: 'Return to Login',
      failedRequest: 'Failed to process request. Please try again.',
      // Reset Password
      createNewPassword: 'Create New Password',
      newPasswordSubtitle: 'Please enter your new password below.',
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password',
      passwordsNoMatch: 'Passwords do not match',
      invalidToken: 'Invalid or missing reset token',
      passwordResetSuccess: 'Password Reset',
      passwordResetRedirect: 'Your password has been successfully reset. Redirecting to login...',
      failedReset: 'Failed to reset password. The link might be expired.',
      invalidLink: 'Invalid Link',
      invalidLinkDesc: 'The password reset link is invalid or missing.',
      goToLogin: 'Go to Login',
      failedDeleteCategory: 'Failed to delete category',
      failedDeleteTransaction: 'Failed to delete transaction',
      failedDeleteWallet: 'Failed to delete wallet',
      failedPayBill: 'Failed to pay bill'
    },

    // Sidebar
    nav: {
      dashboard: 'Dashboard',
      transactions: 'Transactions',
      wallets: 'Wallets',
      analytics: 'Analytics',
      budget: 'Budget',
      goals: 'Goals',
      bills: 'Bills',
      settings: 'Settings',
      addTransaction: 'Add Transaction',
      logout: 'Logout'
    },

    // Dashboard
    dashboard: {
      title: 'Dashboard',
      subtitle: 'Welcome back! Here is your financial overview.',
      totalBalance: 'Total Balance',
      monthlyIncome: 'Monthly Income',
      monthlyExpense: 'Monthly Expense',
      cashFlow: 'Cash Flow',
      cashFlowDesc: 'Income vs Expense over the last 7 months',
      spendingByCategory: 'Spending by Category',
      recentTransactions: 'Recent Transactions',
      totalSavings: 'Total Savings',
      viewAll: 'View All',
      noExpenseData: 'No expense data yet.',
      noTransactions: 'No transactions yet.'
    },

    // Transactions
    transactions: {
      title: 'Transactions',
      subtitle: 'View and manage all your income and expenses.',
      newTransaction: 'New Transaction',
      type: 'Transaction Type',
      category: 'Category',
      amount: 'Amount',
      wallet: 'Wallet',
      date: 'Date',
      note: 'Note',
      noTransactions: 'No transactions yet.',
      addFirst: 'Add your first transaction',
      confirmDelete: 'Are you sure you want to delete this transaction?'
    },

    // Wallets
    wallets: {
      title: 'Wallets',
      subtitle: 'Manage your accounts, cards, and cash balances.',
      addWallet: 'Add Wallet',
      transfer: 'Transfer',
      editDetails: 'Edit details',
      viewTransactions: 'View transactions',
      deleteWallet: 'Delete wallet',
      confirmDelete: 'Are you sure you want to delete this wallet?',
      transferMoney: 'Transfer Money',
      sourceWallet: 'From Wallet',
      destinationWallet: 'To Wallet',
      walletName: 'Wallet Name',
      walletType: 'Wallet Type',
      initialBalance: 'Initial Balance',
      types: {
        bank: 'Bank Account',
        cash: 'Cash',
        credit: 'Credit Card',
        ewallet: 'E-Wallet'
      },
      selectSource: 'Select source',
      selectDestination: 'Select destination',
      transferReason: 'Reason for transfer',
      confirmTransfer: 'Confirm Transfer',
      recentTransfers: 'Recent Transfers',
      recentTransfersDesc: 'History of money moved between your wallets.',
      noTransfers: 'No transfers yet',
      noTransfersDesc: 'You haven\'t made any transfers between your wallets yet. Move money easily with the transfer feature.'
    },

    // Analytics
    analytics: {
      title: 'Analytics',
      subtitle: 'Deep dive into your financial data.',
      monthlyCashFlow: 'Monthly Cash Flow',
      thisYear: 'This Year',
      yearlyIncomeExpense: 'Income vs Expense (Yearly)',
      yearlyDesc: 'Your cashflow history for the past 12 months',
      income: 'Income',
      expense: 'Expense'
    },

    // Budget
    budget: {
      title: 'Budgets',
      subtitle: 'Keep your spending in check.',
      addBudget: 'Add Budget',
      setBudget: 'Set Budget',
      budgetName: 'Budget Name',
      limitAmount: 'Limit Amount',
      period: 'Period',
      targetCategory: 'Target Category',
      monthly: 'Monthly',
      yearly: 'Yearly',
      used: 'used',
      left: 'left',
      over: 'over',
      of: 'of',
      overLimit: 'Over limit',
      noBudgets: 'No budgets created yet.',
      saveBudget: 'Save Budget'
    },

    // Goals
    goals: {
      title: 'Savings Goals',
      subtitle: 'Track your progress towards your financial dreams.',
      createGoal: 'Create Goal',
      addGoal: 'Add Goal',
      goalName: 'Goal Name',
      targetAmount: 'Target Amount',
      currentSaved: 'Current Saved',
      targetDate: 'Target Date',
      colorTheme: 'Color Theme',
      noGoals: 'No goals created yet.',
      target: 'Target'
    },

    // Bills
    bills: {
      title: 'Bills & Subscriptions',
      subtitle: 'Never miss a payment again.',
      addBill: 'Add Bill',
      billName: 'Bill Name',
      dueDate: 'Due Date',
      frequency: 'Frequency',
      oneTime: 'One Time',
      paid: 'Paid',
      upcoming: 'Upcoming',
      overdue: 'Overdue',
      payNow: 'Pay Now',
      noBills: 'No bills created yet.',
      saveBill: 'Save Bill',
      dueOn: 'Due on',
      na: 'N/A',
      confirmPay: 'Are you sure you want to mark this bill as paid?',
      payBill: 'Pay Bill',
      amountToPay: 'Amount to pay'
    },

    // Settings
    settings: {
      title: 'Settings',
      subtitle: 'Manage your account and preferences.',
      profile: 'Profile',
      profileDesc: 'Update your personal information.',
      fullName: 'Full Name',
      email: 'Email',
      saveChanges: 'Save Changes',
      preferences: 'Preferences',
      preferencesDesc: 'Customize your app experience.',
      language: 'Language',
      currency: 'Currency',
      securityData: 'Security & Data',
      securityDesc: 'Manage your security settings and data export.',
      exportData: 'Export Data',
      exportDesc: 'Download all your data as CSV',
      importData: 'Import Data',
      importDesc: 'Restore from a previous backup',
      twoFA: 'Two-Factor Authentication (2FA)',
      twoFADesc: 'Protect your account with an extra layer of security using Google Authenticator.',
      twoFAEnabled: '2FA is Enabled',
      twoFAEnabledDesc: 'Your account is secured with two-factor authentication.',
      disable2FA: 'Disable 2FA',
      enable2FA: 'Enable 2FA',
      scanQR: '1. Scan this QR code with your Authenticator app',
      enterCode: '2. Enter the 6-digit code',
      verify: 'Verify',
      failedGenerate2FA: 'Failed to generate 2FA',
      failedDisable2FA: 'Failed to disable 2FA',
      invalidCode: 'Invalid code'
    }
  }
};

// Vietnamese translations
const vi = {
  translation: {
    // General
    cancel: 'Hủy',
    save: 'Lưu',
    create: 'Tạo',
    delete: 'Xóa',
    edit: 'Sửa',
    success: 'Thành công',
    error: 'Lỗi',
    loading: 'Đang tải...',
    confirm: 'Xác nhận',
    selectCategory: 'Chọn danh mục',
    selectWallet: 'Chọn ví',
    newCategory: '+ Thêm mới',
    noData: 'Không có dữ liệu',
    income: 'Thu nhập',
    expense: 'Chi tiêu',
    exportCSV: 'Xuất CSV',
    searchTransactions: 'Tìm kiếm giao dịch...',
    filters: 'Lọc',
    allTypes: 'Tất cả',
    previous: 'Trước',
    next: 'Sau',
    colors: {
      blue: 'Xanh dương',
      emerald: 'Xanh lục',
      purple: 'Tím',
      orange: 'Cam',
      rose: 'Hồng'
    },

    // Auth
    auth: {
      appName: 'Finova',
      signIn: 'Đăng nhập',
      signUp: 'Đăng ký',
      createAccount: 'Tạo tài khoản',
      username: 'Tên đăng nhập',
      email: 'Email',
      password: 'Mật khẩu',
      forgot: 'Quên?',
      enterUsername: 'Nhập tên đăng nhập',
      enterEmail: 'Nhập email của bạn',
      noAccount: 'Chưa có tài khoản? ',
      hasAccount: 'Đã có tài khoản? ',
      loginSubtitle: 'Nhập thông tin đăng nhập để truy cập tài khoản',
      registerSubtitle: 'Tạo tài khoản để bắt đầu quản lý chi tiêu',
      twoFASubtitle: 'Nhập mã 2FA để tiếp tục',
      authCode: 'Mã xác thực',
      verifyCode: 'Xác minh mã',
      errorOccurred: 'Đã xảy ra lỗi',
      // Forgot Password
      resetPassword: 'Đặt lại mật khẩu',
      forgotSubtitle: 'Nhập email của bạn và chúng tôi sẽ gửi liên kết đặt lại mật khẩu.',
      emailAddress: 'Địa chỉ Email',
      sendResetLink: 'Gửi liên kết đặt lại',
      backToLogin: 'Quay lại đăng nhập',
      checkEmail: 'Kiểm tra email',
      resetLinkSent: 'Chúng tôi đã gửi liên kết đặt lại mật khẩu tới',
      returnToLogin: 'Quay lại đăng nhập',
      failedRequest: 'Xử lý yêu cầu thất bại. Vui lòng thử lại.',
      // Reset Password
      createNewPassword: 'Tạo mật khẩu mới',
      newPasswordSubtitle: 'Vui lòng nhập mật khẩu mới bên dưới.',
      newPassword: 'Mật khẩu mới',
      confirmPassword: 'Xác nhận mật khẩu',
      passwordsNoMatch: 'Mật khẩu không khớp',
      invalidToken: 'Token đặt lại không hợp lệ hoặc bị thiếu',
      passwordResetSuccess: 'Đặt lại mật khẩu',
      passwordResetRedirect: 'Mật khẩu đã được đặt lại thành công. Đang chuyển về trang đăng nhập...',
      failedReset: 'Đặt lại mật khẩu thất bại. Liên kết có thể đã hết hạn.',
      invalidLink: 'Liên kết không hợp lệ',
      invalidLinkDesc: 'Liên kết đặt lại mật khẩu không hợp lệ hoặc bị thiếu.',
      goToLogin: 'Đến trang đăng nhập',
      failedDeleteCategory: 'Xóa danh mục thất bại',
      failedDeleteTransaction: 'Xóa giao dịch thất bại',
      failedDeleteWallet: 'Xóa ví thất bại',
      failedPayBill: 'Thanh toán hóa đơn thất bại'
    },

    // Sidebar
    nav: {
      dashboard: 'Tổng quan',
      transactions: 'Giao dịch',
      wallets: 'Ví tiền',
      analytics: 'Phân tích',
      budget: 'Ngân sách',
      goals: 'Mục tiêu',
      bills: 'Hóa đơn',
      settings: 'Cài đặt',
      addTransaction: 'Thêm giao dịch',
      logout: 'Đăng xuất'
    },

    // Dashboard
    dashboard: {
      title: 'Tổng quan',
      subtitle: 'Chào mừng trở lại! Đây là tình hình tài chính của bạn.',
      totalBalance: 'Tổng số dư',
      monthlyIncome: 'Thu nhập tháng',
      monthlyExpense: 'Chi tiêu tháng',
      cashFlow: 'Dòng tiền',
      cashFlowDesc: 'Thu nhập và chi tiêu 7 tháng qua',
      spendingByCategory: 'Chi tiêu theo danh mục',
      recentTransactions: 'Giao dịch gần đây',
      totalSavings: 'Tổng tiết kiệm',
      viewAll: 'Xem tất cả',
      noExpenseData: 'Chưa có dữ liệu chi tiêu.',
      noTransactions: 'Chưa có giao dịch nào.'
    },

    // Transactions
    transactions: {
      title: 'Giao dịch',
      subtitle: 'Xem và quản lý tất cả thu chi của bạn.',
      newTransaction: 'Giao dịch mới',
      type: 'Loại giao dịch',
      category: 'Danh mục',
      amount: 'Số tiền',
      wallet: 'Ví',
      date: 'Ngày',
      note: 'Ghi chú',
      noTransactions: 'Chưa có giao dịch nào.',
      addFirst: 'Thêm giao dịch đầu tiên'
    },

    // Wallets
    wallets: {
      title: 'Ví tiền',
      subtitle: 'Quản lý tài khoản, thẻ và tiền mặt.',
      addWallet: 'Thêm ví',
      transfer: 'Chuyển tiền',
      editDetails: 'Sửa chi tiết',
      viewTransactions: 'Xem giao dịch',
      deleteWallet: 'Xóa ví',
      confirmDelete: 'Bạn có chắc chắn muốn xóa ví này không?',
      transferMoney: 'Chuyển tiền',
      sourceWallet: 'Từ ví',
      destinationWallet: 'Đến ví',
      walletName: 'Tên ví',
      walletType: 'Loại ví',
      initialBalance: 'Số dư ban đầu',
      types: {
        bank: 'Tài khoản ngân hàng',
        cash: 'Tiền mặt',
        credit: 'Thẻ tín dụng',
        ewallet: 'Ví điện tử'
      },
      selectSource: 'Chọn ví nguồn',
      selectDestination: 'Chọn ví đích',
      transferReason: 'Lý do chuyển tiền',
      confirmTransfer: 'Xác nhận chuyển'
    },

    // Analytics
    analytics: {
      title: 'Phân tích',
      subtitle: 'Xem chi tiết dữ liệu tài chính của bạn.',
      monthlyCashFlow: 'Dòng tiền hàng tháng',
      thisYear: 'Năm nay',
      yearlyIncomeExpense: 'Thu nhập vs Chi tiêu (Năm)',
      yearlyDesc: 'Lịch sử dòng tiền trong 12 tháng qua',
      income: 'Thu nhập',
      expense: 'Chi phí'
    },

    // Budget
    budget: {
      title: 'Ngân sách',
      subtitle: 'Kiểm soát mức chi tiêu của bạn.',
      addBudget: 'Thêm ngân sách',
      setBudget: 'Tạo ngân sách',
      budgetName: 'Tên ngân sách',
      limitAmount: 'Giới hạn',
      period: 'Chu kỳ',
      targetCategory: 'Danh mục áp dụng',
      monthly: 'Hàng tháng',
      yearly: 'Hàng năm',
      used: 'đã dùng',
      left: 'còn lại',
      over: 'vượt quá',
      of: 'trên',
      overLimit: 'Vượt ngân sách',
      noBudgets: 'Chưa có ngân sách nào.',
      saveBudget: 'Lưu ngân sách'
    },

    // Goals
    goals: {
      title: 'Mục tiêu tiết kiệm',
      subtitle: 'Theo dõi tiến độ đạt được ước mơ tài chính.',
      createGoal: 'Tạo mục tiêu',
      addGoal: 'Thêm mục tiêu',
      goalName: 'Tên mục tiêu',
      targetAmount: 'Số tiền mục tiêu',
      currentSaved: 'Đã tiết kiệm',
      targetDate: 'Ngày mục tiêu',
      colorTheme: 'Màu sắc',
      noGoals: 'Chưa có mục tiêu nào.',
      target: 'Mục tiêu'
    },

    // Bills
    bills: {
      title: 'Hóa đơn & Đăng ký',
      subtitle: 'Không bao giờ trễ hạn thanh toán.',
      addBill: 'Thêm hóa đơn',
      billName: 'Tên hóa đơn',
      dueDate: 'Ngày đến hạn',
      frequency: 'Tần suất',
      oneTime: 'Một lần',
      paid: 'Đã thanh toán',
      upcoming: 'Sắp tới',
      overdue: 'Quá hạn',
      payNow: 'Thanh toán ngay',
      noBills: 'Chưa có hóa đơn nào.',
      saveBill: 'Lưu hóa đơn',
      dueOn: 'Đến hạn vào',
      na: 'Trống',
      confirmPay: 'Bạn có chắc chắn muốn thanh toán hóa đơn này không?',
      payBill: 'Thanh toán hóa đơn',
      amountToPay: 'Số tiền cần thanh toán'
    },

    // Settings
    settings: {
      title: 'Cài đặt',
      subtitle: 'Quản lý tài khoản và tùy chọn.',
      profile: 'Hồ sơ',
      profileDesc: 'Cập nhật thông tin cá nhân.',
      fullName: 'Họ và tên',
      email: 'Email',
      saveChanges: 'Lưu thay đổi',
      preferences: 'Tùy chọn',
      preferencesDesc: 'Tùy chỉnh trải nghiệm ứng dụng.',
      language: 'Ngôn ngữ',
      currency: 'Tiền tệ',
      securityData: 'Bảo mật & Dữ liệu',
      securityDesc: 'Quản lý bảo mật và xuất dữ liệu.',
      exportData: 'Xuất dữ liệu',
      exportDesc: 'Tải xuống toàn bộ dữ liệu (CSV)',
      importData: 'Nhập dữ liệu',
      importDesc: 'Khôi phục từ bản sao lưu'
    }
  }
};

const savedLang = localStorage.getItem('finova_lang') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en,
      vi
    },
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
