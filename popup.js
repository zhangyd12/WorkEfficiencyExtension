// 默认假期列表（作为回退）
let holidays = [
  "2023-01-01", // 元旦
  "2023-05-01", // 劳动节
  "2023-10-01"  // 国庆节
].map((date) => new Date(date).toDateString()); // 转换为标准日期字符串

/**
 * 从 API 获取节假日数据
 * @param {number} year - 查询的年份
 */
async function fetchHolidays(year = new Date().getFullYear()) {
  const apiUrl = `http://timor.tech/api/holiday/year/${year}?type=Y&week=Y`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // 检查返回数据是否正常
    if (data.code !== 0 || !data.holiday) {
      throw new Error("API 返回数据异常");
    }

    // 提取假期日期
    holidays = Object.values(data.holiday).map((holiday) =>
      new Date(holiday.date).toDateString()
    );
   let holidayDetails = Object.values(data.holiday).map((holiday) => ({
      date: new Date(holiday.date).toDateString(),
      name: holiday.name
    }));

    
  } catch (error) {
    console.error("获取假期列表失败，使用默认假期列表:", error);
  }
}

/**
 * 判断某一天是否是假期
 * @param {Date} date - 要判断的日期
 * @returns {boolean} - 是否是假期
 */
function isHoliday(date) {
  return holidays.includes(date.toDateString());
}

// 调用函数获取当前年份的假期列表
fetchHolidays();

// 示例：检查今天是否是假期
const today = new Date();
if (isHoliday(today)) {
  console.log("今天是假期！");
} else {
  console.log("今天不是假期！");
}

/**
 * 从缓存或 API 获取假期列表
 */
async function getHolidays() {
  const cachedHolidays = localStorage.getItem("holidays");
  const cachedYear = localStorage.getItem("holidaysYear");
  const currentYear = new Date().getFullYear();

  if (cachedHolidays && cachedYear == currentYear) {
    holidays = JSON.parse(cachedHolidays);
  } else {
    await fetchHolidays(currentYear);
    localStorage.setItem("holidays", JSON.stringify(holidays));
    localStorage.setItem("holidaysYear", currentYear);
  }
}

// 调用函数获取假期列表
getHolidays();

// 打字效果
function typeText(elementId, text, delay = 50) {
    const element = document.getElementById(elementId);
    element.textContent = ''; // 清空内容
    let index = 0;

    const interval = setInterval(() => {
        if (index < text.length) {
            element.textContent += text[index];
            index++;
        } else {
            clearInterval(interval);
        }
    }, delay);
}
// 当页面加载完成后，执行以下逻辑
document.addEventListener("DOMContentLoaded", function () {
  // 获取页面中的元素
  const earningsDiv = document.getElementById("earnings"); // 显示收入信息的容器
  const monthlySalaryInput = document.getElementById("monthlySalary"); // 输入月薪的输入框
  const updateButton = document.getElementById("updateButton"); // 更新工资的按钮

  // 初始化一个工资计算器对象，初始时薪为 0
  let calculator = new WorkEfficiencyCalculator(0);

  /**
   * 计算本月的工作日数
   * @param {boolean} upToToday - 是否只计算到今天为止的工作日数
   * @returns {number} - 返回工作日的总数
   */
  function calculateWorkedDays(upToToday = false) {
    const today = new Date(); // 获取当前日期
    let workedDays = 0; // 初始化工作日计数

    // 获取本月的总天数
    const daysInMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    ).getDate();

    // 遍历本月的每一天
    for (
      let day = 1;
      day <= (upToToday ? today.getDate() : daysInMonth);
      day++
    ) {
      const currentDay = new Date(today.getFullYear(), today.getMonth(), day); // 当前日期
      const dayOfWeek = currentDay.getDay(); // 获取当前日期是星期几
      const isHoliday = holidays.includes(currentDay.toDateString()); // 判断当前日期是否是假期

      // 如果不是周末（周六、周日）且不是假期，则计为工作日
      if (dayOfWeek !== 0 && dayOfWeek !== 6 && !isHoliday) {
        workedDays++;
      }
    }
    return workedDays; // 返回工作日总数
  }

/**
 * 计算本周的收入
 * @returns {number} - 返回本周的收入
 */
function calculateWeeklyEarnings() {
    const today = new Date(); // 获取当前日期
    const startOfWeek = new Date(today); // 初始化本周的开始日期
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // 设置为本周一
    let weeklyEarnings = 0; // 初始化本周收入

    // 遍历本周的每一天
    for (let day = new Date(startOfWeek); day <= today; day.setDate(day.getDate() + 1)) {
        const dayOfWeek = day.getDay(); // 获取当前日期是星期几
        const isHoliday = holidays.includes(day.toDateString()); // 判断当前日期是否是假期

        // 如果不是周末且不是假期，则累加当天的收入
        if (dayOfWeek !== 0 && dayOfWeek !== 6 && !isHoliday) {
            weeklyEarnings += calculator.calculateTodayEarnings(); // 累加当天收入
        }
    }
    return weeklyEarnings; // 返回本周收入
}

  /**
   * 更新页面上的收入信息
   */
// 更新收入信息并触发动画
function updateEarnings() {
    const workedDaysSoFar = calculateWorkedDays(true); // 计算到今天为止的工作日数
    const workedDaysInMonth = calculateWorkedDays(); // 计算整个工作月的工作日数
    const monthlyEarningsSoFar = calculator.calculateTodayEarnings() * workedDaysSoFar; // 计算本月已挣收入
    const hourlyWage = calculator.hourlyWage.toFixed(2); // 获取时薪并保留两位小数
    const dailyWage = (calculator.hourlyWage * 8).toFixed(2); // 计算日薪（每日工作 8 小时）
    const weeklyEarnings = calculateWeeklyEarnings().toFixed(2); // 计算本周收入

    // 触发彩带动画
    triggerConfetti();

    // 更新页面上的收入信息
    typeText('hourlyWageText', `时薪: ${hourlyWage} 元`);
    typeText('dailyWageText', `日薪: ${dailyWage} 元`);
    typeText('todayEarningsText', `今日已挣: ${calculator.calculateTodayEarnings().toFixed(2)} 元`);
    typeText('weeklyEarningsText', `本周已挣: ${weeklyEarnings} 元`);
    typeText('monthlyEarningsText', `本月已挣: ${monthlyEarningsSoFar.toFixed(2)} 元`);
}

  // 当用户离开月薪输入框时，验证输入的月薪是否有效
  monthlySalaryInput.addEventListener("blur", function () {
    const monthlySalary = parseInt(monthlySalaryInput.value, 10); // 获取用户输入的月薪
    if (isNaN(monthlySalary) || monthlySalary <= 0) {
      // 如果输入无效，则清空输入框
      monthlySalaryInput.value = "";
    }
  });

  // 当用户点击更新按钮时，更新工资计算器并刷新收入信息
  updateButton.addEventListener("click", function () {
    const monthlySalary = parseInt(monthlySalaryInput.value, 10); // 获取用户输入的月薪
    if (!isNaN(monthlySalary) && monthlySalary > 0) {
      // 如果输入有效
      const workedDaysInMonth = calculateWorkedDays(); // 计算本月的工作日数
      const hourlyWage = monthlySalary / (workedDaysInMonth * 8); // 计算时薪（每日工作 8 小时）
      calculator = new WorkEfficiencyCalculator(hourlyWage); // 更新工资计算器
      updateEarnings(); // 刷新收入信息
    }
  });

  // 页面加载时，初始化收入信息
  updateEarnings();
});

function triggerConfetti() {
  const confettiContainer = document.querySelector('.confetti-container');
  confettiContainer.innerHTML = ''; // 清空之前的彩带

  const confettiCount = 20; // 彩带数量
  const colors = ['#ff3e3e', '#ffdd00', '#3eff3e', '#3e3eff', '#ff6f91', '#845ec2']; // 彩带颜色

  for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.classList.add('confetti');

      // 随机设置彩带的颜色
      const color = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.background = color;

      // 随机设置彩带的初始位置
      const isLeft = Math.random() > 0.5; // 随机决定彩带从左侧还是右侧生成
      if (isLeft) {
          confetti.style.left = Math.random() * 50 + '%'; // 左侧 0% ~ 50%
          confetti.style.bottom = '0'; // 从底部开始
      } else {
          confetti.style.right = Math.random() * 50 + '%'; // 右侧 0% ~ 50%
          confetti.style.bottom = '0'; // 从底部开始
      }

      // 随机设置动画路径
      const translateX = isLeft ? Math.random() * 100 + 50 : -(Math.random() * 100 + 50); // 左侧向右飘，右侧向左飘
      confetti.style.setProperty('--translateX', `${translateX}px`);

      // 随机设置动画时长
      const animationDuration = Math.random() * 1 + 2; // 2秒到3秒
      confetti.style.animationDuration = `${animationDuration}s`;

      // 随机设置动画延迟
      const animationDelay = Math.random() * 1; // 0秒到1秒
      confetti.style.animationDelay = `${animationDelay}s`;

      confettiContainer.appendChild(confetti);
  }

  // 移除彩带，避免页面堆积
  setTimeout(() => {
      confettiContainer.innerHTML = '';
  }, 4000); // 4秒后清除彩带
}

