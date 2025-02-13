class WorkEfficiencyCalculator {
    constructor(hourlyWage) {
        this.hourlyWage = hourlyWage;
        this.dailyHours = 8; // 默认每日工作时长8小时
        this.todayEarnings = 0;
        this.weeklyEarnings = 0;
        this.monthlyEarnings = 0;
    }

    calculateTodayEarnings() {
        this.todayEarnings = this.hourlyWage * this.dailyHours;
        return this.todayEarnings;
    }

    calculateWeeklyEarnings() {
        this.weeklyEarnings = this.calculateTodayEarnings() * 5;
        return this.weeklyEarnings;
    }

    calculateMonthlyEarnings() {
        this.monthlyEarnings = this.calculateTodayEarnings() * 22;
        return this.monthlyEarnings;
    }
} 