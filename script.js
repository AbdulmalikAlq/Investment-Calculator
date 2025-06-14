class InvestmentCalculator {
    constructor() {
        this.initialInput = document.getElementById('initial');
        this.initialPriceInput = document.getElementById('initialPrice');
        this.dividendInput = document.getElementById('dividend');
        this.growthInput = document.getElementById('growth');
        this.monthlyAdditionInput = document.getElementById('monthlyAddition');
        this.startYearInput = document.getElementById('startYear');
        this.yearsInput = document.getElementById('years');
        this.resultDiv = document.getElementById('result');
        this.yearlyData = [];
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
    }

    getInputValues() {
        return {
            initial: parseFloat(this.initialInput.value),
            initialPrice: parseFloat(this.initialPriceInput.value),
            dividend: parseFloat(this.dividendInput.value),
            growthRate: parseFloat(this.growthInput.value) / 100,
            monthlyAddition: parseFloat(this.monthlyAdditionInput.value),
            startYear: parseInt(this.startYearInput.value),
            years: parseInt(this.yearsInput.value)
        };
    }

    calculate() {
        const values = this.getInputValues();
        let currentPrice = values.initialPrice;
        let shares = values.initial / values.initialPrice;
        let totalInvested = values.initial;
        let totalDividends = 0;

        this.yearlyData = [];

        for (let year = 1; year <= values.years; year++) {
            const yearlyDividend = shares * values.dividend;
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
    }

    displayResults(yearlyData) {
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
                            <tr>
                                <th>السنة</th>
                                <th>عدد الأسهم</th>
                                <th>سعر السهم</th>
                                <th>قيمة المحفظة</th>
                                <th>الأرباح السنوية</th>
                                <th>الإضافة السنوية</th>
                                <th>نسبة النمو</th>
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
                    <td>${this.formatCurrency(year.yearlyDividend)}</td>
                    <td>${this.formatCurrency(year.year >= this.getInputValues().startYear ? this.getInputValues().monthlyAddition * 12 : 0)}</td>
                    <td data-value="${yearRoi}">${this.formatNumber(yearRoi)}%</td>
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

let calculator;
document.addEventListener('DOMContentLoaded', () => {
    calculator = new InvestmentCalculator();
});

function calculate() {
    calculator.calculate();
}
