class InvestmentCalculator {    constructor() {
        this.initialInput = document.getElementById('initial');
        this.initialPriceInput = document.getElementById('initialPrice');
        this.dividendInput = document.getElementById('dividend');
        this.growthInput = document.getElementById('growth');
        this.monthlyAdditionInput = document.getElementById('monthlyAddition');
        this.startYearInput = document.getElementById('startYear');
        this.yearsInput = document.getElementById('years');
        this.resultDiv = document.getElementById('result');
    }

    formatCurrency(value) {
        return new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: 'SAR',
            maximumFractionDigits: 2
        }).format(value);
    }

    formatNumber(value) {
        return new Intl.NumberFormat('ar-SA', {
            maximumFractionDigits: 2
        }).format(value);
    }    getInputValues() {
        return {
            initial: parseFloat(this.initialInput.value),
            initialPrice: parseFloat(this.initialPriceInput.value),
            dividend: parseFloat(this.dividendInput.value),
            growthRate: parseFloat(this.growthInput.value) / 100,
            monthlyAddition: parseFloat(this.monthlyAdditionInput.value),
            startYear: parseInt(this.startYearInput.value),
            years: parseInt(this.yearsInput.value)
        };
    }    calculate() {
        const values = this.getInputValues();
        let currentPrice = values.initialPrice;
        let shares = values.initial / values.initialPrice;
        let totalInvested = values.initial;
        let totalDividends = 0;

        this.yearlyData = [];

        for (let year = 1; year <= values.years; year++) {const yearlyDividend = shares * values.dividend;
            totalDividends += yearlyDividend;

            const addition = (year >= values.startYear) ? values.monthlyAddition * 12 : 0;
            totalInvested += addition;

            const totalToReinvest = yearlyDividend + addition;
            const newShares = totalToReinvest / currentPrice;
            shares += newShares;

            currentPrice *= (1 + values.growthRate);

            this.yearlyData.push({
                year,
                shares,
                currentPrice,
                portfolioValue: shares * currentPrice,
                yearlyDividend,
                totalDividends,
                totalInvested
            });
        }

        this.displayResults(this.yearlyData[this.yearlyData.length - 1]);
    }    displayResults(yearlyData) {
        const roi = ((yearlyData.portfolioValue - yearlyData.totalInvested) / yearlyData.totalInvested) * 100;
        
        // الملخص النهائي
        let summary = `
            <div class="summary-section">
                <h3>الملخص النهائي</h3>
                <div class="result-item">
                    <div class="result-label">عدد الأسهم النهائي</div>
                    <div class="result-value">${this.formatNumber(yearlyData.shares)} سهم</div>
                </div>
                <div class="result-item">
                    <div class="result-label">سعر السهم المتوقع</div>
                    <div class="result-value">${this.formatCurrency(yearlyData.currentPrice)}</div>
                </div>
                <div class="result-item">
                    <div class="result-label">قيمة المحفظة النهائية</div>
                    <div class="result-value">${this.formatCurrency(yearlyData.portfolioValue)}</div>
                </div>
                <div class="result-item">
                    <div class="result-label">إجمالي الاستثمار</div>
                    <div class="result-value">${this.formatCurrency(yearlyData.totalInvested)}</div>
                </div>
                <div class="result-item">
                    <div class="result-label">إجمالي الأرباح الموزعة</div>
                    <div class="result-value">${this.formatCurrency(yearlyData.totalDividends)}</div>
                </div>
                <div class="result-item">
                    <div class="result-label">العائد على الاستثمار</div>
                    <div class="result-value">${this.formatNumber(roi)}%</div>
                </div>
            </div>
        `;

        // جدول التفاصيل السنوية
        let yearlyTable = `
            <div class="yearly-details">
                <h3>التفاصيل السنوية</h3>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>                                <th>السنة</th>
                                <th>عدد الأسهم</th>
                                <th>سعر السهم</th>
                                <th>قيمة المحفظة</th>
                                <th>الأرباح السنوية</th>
                                <th>الإضافة السنوية</th>
                                <th>نسبة النمو السنوي</th>
                                <th>إجمالي الاستثمار</th>
                            </tr>
                        </thead>
                        <tbody>
        `;

        this.yearlyData.forEach((year, index) => {
            const yearRoi = index === 0 ? 0 : 
                ((year.portfolioValue - this.yearlyData[index-1].portfolioValue - (year.totalInvested - this.yearlyData[index-1].totalInvested)) / 
                this.yearlyData[index-1].portfolioValue * 100);

            yearlyTable += `
                <tr>
                    <td>${year.year}</td>
                    <td>${this.formatNumber(year.shares)}</td>
                    <td>${this.formatCurrency(year.currentPrice)}</td>
                    <td>${this.formatCurrency(year.portfolioValue)}</td>
                    <td>${this.formatCurrency(year.yearlyDividend)}</td>                    <td>${this.formatCurrency(year.year >= this.getInputValues().startYear ? this.getInputValues().monthlyAddition * 12 : 0)}</td>
                    <td>${this.formatNumber(yearRoi)}%</td>
                    <td>${this.formatCurrency(year.totalInvested)}</td>
                </tr>
            `;
        });

        yearlyTable += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        this.resultDiv.innerHTML = summary + yearlyTable;
    }
}

// Theme management
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

document.getElementById('themeToggle').addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

// Settings management
function saveSettings() {
    const settings = {
        initial: document.getElementById('initial').value,
        initialPrice: document.getElementById('initialPrice').value,
        dividend: document.getElementById('dividend').value,
        growth: document.getElementById('growth').value,
        monthlyAddition: document.getElementById('monthlyAddition').value,
        startYear: document.getElementById('startYear').value,
        years: document.getElementById('years').value
    };
    localStorage.setItem('calculatorSettings', JSON.stringify(settings));
    alert('تم حفظ الإعدادات بنجاح');
}

function loadSettings() {
    const savedSettings = localStorage.getItem('calculatorSettings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        Object.entries(settings).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.value = value;
        });
    }
}

function resetSettings() {
    document.getElementById('initial').value = '180880';
    document.getElementById('initialPrice').value = '25';
    document.getElementById('dividend').value = '1.8216';
    document.getElementById('growth').value = '3';
    document.getElementById('monthlyAddition').value = '1000';
    document.getElementById('startYear').value = '6';
    document.getElementById('years').value = '15';
    localStorage.removeItem('calculatorSettings');
    alert('تم إعادة تعيين الإعدادات');
}

// Investment calculations
function formatNumber(number) {
    return new Intl.NumberFormat('ar-SA').format(number.toFixed(2));
}

function calculate() {
    const initial = parseFloat(document.getElementById('initial').value);
    const initialPrice = parseFloat(document.getElementById('initialPrice').value);
    const dividend = parseFloat(document.getElementById('dividend').value);
    const growth = parseFloat(document.getElementById('growth').value) / 100;
    const monthlyAddition = parseFloat(document.getElementById('monthlyAddition').value);
    const startYear = parseInt(document.getElementById('startYear').value);
    const years = parseInt(document.getElementById('years').value);

    let initialShares = initial / initialPrice;
    let yearlyData = [];
    let currentValue = initial;
    let totalDividends = 0;
    let totalInvestment = initial;

    for (let year = 1; year <= years; year++) {
        const yearPrice = initialPrice * Math.pow(1 + growth, year);
        const yearDividend = dividend * initialShares;
        totalDividends += yearDividend;

        if (year >= startYear) {
            const yearlyAddition = monthlyAddition * 12;
            totalInvestment += yearlyAddition;
            initialShares += yearlyAddition / yearPrice;
        }

        currentValue = initialShares * yearPrice;

        yearlyData.push({
            year,
            value: currentValue,
            dividends: yearDividend,
            shares: initialShares,
            price: yearPrice
        });
    }

    displayResults(yearlyData, totalInvestment, totalDividends);
    updateCharts(yearlyData);
}

function displayResults(yearlyData, totalInvestment, totalDividends) {
    const lastYear = yearlyData[yearlyData.length - 1];
    const totalReturn = ((lastYear.value - totalInvestment) / totalInvestment * 100).toFixed(2);

    const resultHTML = `
        <h3>نتائج الاستثمار</h3>
        <div style="margin-top: 1rem;">
            <p>إجمالي الاستثمار: ${formatNumber(totalInvestment)} ريال</p>
            <p>القيمة النهائية: ${formatNumber(lastYear.value)} ريال</p>
            <p>عدد الأسهم النهائي: ${formatNumber(lastYear.shares)}</p>
            <p>سعر السهم النهائي: ${formatNumber(lastYear.price)} ريال</p>
            <p>إجمالي الأرباح الموزعة: ${formatNumber(totalDividends)} ريال</p>
            <p>العائد الإجمالي: ${totalReturn}%</p>
        </div>
    `;

    document.getElementById('result').innerHTML = resultHTML;
}

function updateCharts(yearlyData) {
    // Investment Growth Chart
    const investmentCtx = document.getElementById('investmentChart').getContext('2d');
    new Chart(investmentCtx, {
        type: 'line',
        data: {
            labels: yearlyData.map(data => `السنة ${data.year}`),
            datasets: [{
                label: 'قيمة الاستثمار',
                data: yearlyData.map(data => data.value),
                borderColor: getComputedStyle(document.documentElement).getPropertyValue('--primary-color'),
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'نمو الاستثمار',
                    font: {
                        family: 'Saudi'
                    }
                }
            }
        }
    });

    // Dividend Growth Chart
    const dividendCtx = document.getElementById('dividendChart').getContext('2d');
    new Chart(dividendCtx, {
        type: 'bar',
        data: {
            labels: yearlyData.map(data => `السنة ${data.year}`),
            datasets: [{
                label: 'الأرباح السنوية',
                data: yearlyData.map(data => data.dividends),
                backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--secondary-color'),
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'الأرباح السنوية',
                    font: {
                        family: 'Saudi'
                    }
                }
            }
        }
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadSettings();
});
