/* Embedded seed data — used when fetch() of /data/*.csv fails (file:// protocol).
 * All values here are GENERIC SAMPLES. Replace with your own via the UI or CSV import.
 * Do NOT commit your personal data to this file if pushing to a public repo.
 */
window.EMBEDDED_SEED = {
  investments: `id,entity,term,category,expiry,invested_lakh,current_value_lakh,realized_profit_lakh,owner,client_id,policy_number,due_date,notes
1,Equity Mutual Fund,Long Term,Equity,2030,5,7,0,,,,,Sample
2,Direct Stocks,Long Term,Equity,,3,5,0,,,,,Sample
3,PPF,Long Term,FD,2035,3,5,0,,,,2035,Sample
4,SSY,Long Term,FD,2040,2,3,0,,,,2040,Sample
5,Fixed Deposit,Mid Term,FD,2028,2,2.2,0,,,,2028,Sample
6,Gold Jewellery,Long Term,Gold,,2,4,0,,,,,Sample
7,Sovereign Gold Bond,Long Term,Gold,2028,1,2,0,,,,,Sample
8,Provident Fund,Retirement,Retirement,2046,10,10,0,,,,,Sample
9,NPS,Retirement,Retirement,2049,2,2.5,0,,,,,Sample
10,ULIP,Mid Term,Equity,2029,1,1.2,0,,,,,Sample
`,
  loans: `id,category,outstanding,end_year,emi,notes
1,Home,2000000,2040,20000,Sample home loan
2,Personal,500000,2032,8000,Sample personal loan
`,
  real_estate: `id,property,address,owner,purchase_year,acquired_cost,current_value,outstanding_loan,monthly_rent,notes
1,Primary Residence,,,2020,3000000,3500000,2000000,0,Sample - with home loan
2,Investment Apartment,,,2022,2500000,2800000,0,15000,Sample - rented out
3,Plot,,,2023,1000000,1200000,0,0,Sample - land
`,
  transactions: `id,date,merchant,amount,category,subcategory,card,source_statement,notes
1,2026-04-15,LOCAL CAFE,250.00,Dining,Cafe,Credit Card,Sample,
2,2026-04-18,GROCERY STORE,3500.00,Grocery,Retail,Credit Card,Sample,
3,2026-04-20,FUEL STATION,2500.00,Fuel,Petrol,Credit Card,Sample,
4,2026-04-22,RESTAURANT,1200.00,Dining,Restaurant,Credit Card,Sample,
5,2026-04-25,PHARMACY,500.00,Medical,Pharmacy,Credit Card,Sample,
6,2026-05-01,UTILITY BILL,1200.00,Utility,Electricity,Bank Transfer,Sample,
7,2026-05-05,INSURANCE PREMIUM,8500.00,Insurance,General,Credit Card,Sample,
8,2026-05-10,ONLINE SHOPPING,2400.00,Shopping,Apparel,Credit Card,Sample,
9,2026-05-15,MOVIE TICKETS,500.00,Entertainment,Movies,Credit Card,Sample,
10,2026-05-18,RESTAURANT,800.00,Dining,Restaurant,Credit Card,Sample,
`,
  planned_budget: `id,category,subcategory,monthly,annual,payment_mode,notes
1,Grocery,Groceries,10000,120000,Card,
2,Grocery,Fruits & Vegetables,5000,60000,Cash,
3,Utility,Wifi/Broadband,1500,18000,Card,
4,Utility,Mobile,500,6000,Card,
5,Utility,Electricity,1500,18000,Card,
6,Utility,Gas,500,6000,Card,
7,Medical,Medicine,3000,36000,Card,
8,Medical,Doctor,2000,24000,Card,
9,Fuel,Petrol,4000,48000,Card,
10,Dining,Restaurants,3000,36000,Card,
11,Maid,Housekeeping,3000,36000,Cash,
12,Rent,House Rent,30000,360000,Bank Transfer,
13,Loan,Home Loan EMI,20000,240000,Bank Transfer,
14,Loan,Personal Loan EMI,8000,96000,Bank Transfer,
15,Insurance,Term Insurance,5000,60000,Card,
16,Insurance,Car Insurance,1000,12000,Card,
17,Investment,Equity SIP,10000,120000,Bank Transfer,
18,Investment,Gold,1000,12000,Bank Transfer,
19,Education,School Fees,20000,240000,Card,
20,Travel,Annual Trip,5000,60000,Card,
21,Shopping,General,5000,60000,Card,
22,Entertainment,Discretionary,2000,24000,Card,
`,
  future_projections: `id,year,age,phase,total_assets_lakh,annual_expense_lakh,annual_income_lakh,net_change_lakh,notes
1,2026,37,Earning,80,12,21,9,Sample starting point
`,
  projection_segments: `id,name,type,monthly_amount,annual_amount,yoy_growth_pct,return_pct,start_year,end_year,current_balance,notes
1,Salary,income,0,1500000,8,0,2026,2046,0,Sample - edit to your value
2,Bonus,income,0,500000,8,0,2026,2046,0,Sample annual bonus
3,Rental Income,income,0,0,5,0,2030,2090,0,Future rental from properties
4,Business,investment,0,0,5,12,2026,2046,0,Direct business investments - speculative
5,Equity,investment,0,60000,8,12,2026,2046,500000,Mutual funds + stocks + ULIP. Aim 12% long-term
6,FD / Fixed Income,investment,0,150000,5,7,2026,2046,500000,PPF + SSY + RDs combined. PPF/SSY cap at 1.5L each
7,Gold,investment,0,10000,5,8,2026,2046,500000,Physical gold + Sovereign Gold Bonds (SGBs)
8,Retirement (PF + NPS),investment,0,150000,5,9,2026,2046,1000000,EPF + NPS combined contributions
9,Real Estate,investment,0,250000,0,6,2026,2040,5000000,Home loan EMI principal portion + market appreciation
10,Living Expenses,expense,40000,0,6,0,2026,2090,0,Grocery + Utilities + Misc monthly recurring
11,House Rent,expense,30000,0,6,0,2026,2090,0,Rent grows with inflation
12,Home Loan EMI,expense,20000,0,0,0,2026,2040,0,Fixed EMI until 2040
13,Personal Loan EMI,expense,8000,0,0,0,2026,2040,0,Fixed EMI until 2040
14,School Fees,expense,20000,0,8,0,2026,2040,0,Education inflation high - until kid graduates
15,Travel & Discretionary,expense,0,100000,7,0,2026,2080,0,Annual lumpy travel + shopping
16,Insurance Premiums,expense,0,60000,5,0,2026,2080,0,Term + Car + Life Insurance etc
17,Pension Annuity,investment,0,0,0,6,2049,2090,0,Mandatory 40% of NPS at age 60 (low return low vol)
`,
  projection_segment_yearly: `id,segment_id,year,annual_amount,return_pct,notes
`,
  actual_overrides: `id,period,category,amount,notes
`,
  goals: `id,name,target_year,target_amount,current_allocation,monthly_contribution,expected_return_pct,priority,linked_segment,notes
1,Retirement Corpus,2050,50000000,2000000,50000,8,high,Retirement (PF + NPS),Sample - target 25x annual expense
2,Child Education,2040,5000000,500000,15000,8,high,FD / Fixed Income,Sample - SSY + dedicated SIP
3,Home Upgrade,2035,3000000,0,10000,9,medium,Equity,Sample - property or renovation
4,Vacation Fund,2030,1000000,0,5000,8,low,Equity,Sample - annual trips
5,Emergency Fund,2027,500000,100000,5000,6,high,FD / Fixed Income,Sample - 6 months expenses
`,
  taxonomy: `id,type,name,parent,notes
1,category,Dining,,
2,category,Fuel,,
3,category,Entertainment,,
4,category,Travel,,
5,category,Insurance,,
6,category,Investment,,
7,category,Medical,,
8,category,Shopping,,
9,category,Grocery,,
10,category,Utility,,
11,category,Education,,
12,category,Maid,,
13,category,Service,,
14,category,Loan,,
15,category,Rent,,
16,category,Misc,,
17,subcategory,Restaurant,Dining,
18,subcategory,Cafe,Dining,
19,subcategory,Petrol,Fuel,
20,subcategory,Movies,Entertainment,
21,subcategory,Flights,Travel,
22,subcategory,Hotels,Travel,
23,subcategory,Term,Insurance,
24,subcategory,Car,Insurance,
25,subcategory,Health,Insurance,
26,subcategory,Equity SIP,Investment,
27,subcategory,Gold,Investment,
28,subcategory,PPF,Investment,
29,subcategory,NPS,Investment,
30,subcategory,Pharmacy,Medical,
31,subcategory,Doctor,Medical,
32,subcategory,Apparel,Shopping,
33,subcategory,Electronics,Shopping,
34,subcategory,Retail,Grocery,
35,subcategory,Mobile,Utility,
36,subcategory,Electricity,Utility,
37,subcategory,School,Education,
38,subcategory,Higher Ed,Education,
39,subcategory,Home Loan,Loan,
40,subcategory,Personal Loan,Loan,
41,subcategory,House Rent,Rent,
42,card,Credit Card,,
43,card,Bank Transfer,,
44,card,Cash,,
45,card,UPI,,
`,
  reward_targets: `id,category,best_card,monthly_spend,reward_rate_pct,annual_reward_target
1,Grocery & Utilities,Card A,14000,3.0,2520
2,Insurance Payments,Card A,5000,3.0,180
3,Medical/Shopping,Card A,10000,3.0,900
4,Utilities,Card B,3000,8.0,240
5,Fuel,Card A,4000,0.0,0
6,Flights,Card A,5000,18.0,900
7,Hotels,Card A,5000,36.0,1800
`
};
