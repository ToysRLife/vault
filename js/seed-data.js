/* Embedded seed data — used when fetch() of /data/*.csv fails (file:// protocol).
 * Re-generate this file by exporting CSVs from the app and pasting their contents back.
 */
window.EMBEDDED_SEED = {
  investments: `id,entity,term,category,expiry,invested_lakh,current_value_lakh,realized_profit_lakh,owner,client_id,policy_number,due_date,notes
1,Business Investment,Mid Term,Business,2025,1.65,0,2,,,,,
2,Mutual Fund - Equity (annual),Mid Term,Equity,2025,3,0,3.5,,,,,
3,Brokerage Account,Short Term,Equity,2021,6,0,5.5,,,,,
4,PPF,Long Term,FD,2035,3.7,5.7,0,,,,2035,
5,Locker / Savings,Short Term,FD,2021,0.1,0.1,0,,,,,
6,SSY,Long Term,FD,2040,0,2.5,,,,,,
7,Life Insurance - Endowment,Long Term,FD,2030,0.24,0.24,,,,,,
8,Recurring Deposit (annual),Long Term,FD,2030,1.5,1.5,0,,,,,
9,Gold Chain,Long Term,Gold,,0.71,2.1,0,,,,,12 grams
10,Gold Bracelet,Long Term,Gold,,0.6,2.1,0,,,,,12 grams
11,Gold Chain 2,Long Term,Gold,,0.98,0.98,,,,,,12 grams
12,Gold Coin,Long Term,Gold,,0.6,1.75,0,,,,,10 grams
13,Gold Bangle,Long Term,Gold,,1.1,4.38,0,,,,,25 grams
14,Gold Kalyan Chain,Long Term,Gold,,0.17,0.53,0,,,,,3 grams
15,Gold Kalyan Item,Long Term,Gold,,0.37,1.4,0,,,,,8 grams
16,SGB 2020-21 Series II,Long Term,Gold,2028,0.9,3.5,0,,,,,20 grams
17,SGB 2020-21 Series IV,Long Term,Gold,2028,0.96,3.5,0,,,,,20 grams
18,SGB 2020-21 Series V,Long Term,Gold,2028,2.11,7,0,,,,,40 grams
19,SGB 2021 May,Long Term,Gold,2029,0.95,3.5,0,,,,,20 grams
20,SGB 2021-22 Series VI,Long Term,Gold,2029,0.94,3.5,0,,,,,20 grams
21,Gold Ring,Long Term,Gold,,0.88,1.23,,,,,,7 grams
22,SGB 2020-21 Series IX,Long Term,Gold,2029,0.49,1.75,0,,,,,10 grams
23,Provident Fund (EPF),Retirement,Retirement,2046,12.32,12.32,0,,,,,Provident Fund
24,ULIP - Equity,Mid Term,Equity,2029,0.2,0.2,0,,,,,Max Life
`,
  loans: `id,category,outstanding,end_year,emi,notes
1,Home,2100000,2040,22000,Home loan EMI
2,Car,0,2023,5500,Car loan closed
3,Personal,900000,2040,8500,Personal loan EMI
`,
  real_estate: `id,property,address,owner,purchase_year,acquired_cost,current_value,outstanding_loan,monthly_rent,notes
1,Apartment 1,,,2021,3553500,3767500,2100000,0,Example - home loan outstanding
2,Apartment 2,,,,,,,,Example placeholder
3,Villa Plot,,,2023,2942043,2942043,0,0,Example - possession received
4,Farmland,,,2023,795700,983200,0,0,Example - partial payments made
`,
  transactions: `id,date,merchant,amount,category,subcategory,card,source_statement,notes
1,2026-04-18,BRIMS KITCHEN BANGALORE,667.00,Dining,Restaurant,ICICI Emerald,ICICI_May_26,
2,2026-04-18,CHAI POINT BANGALORE,129.00,Dining,Cafe,ICICI Emerald,ICICI_May_26,
3,2026-04-18,PAYBOOKMYSHOW COM GURGAON,483.34,Entertainment,Movies,ICICI Emerald,ICICI_May_26,
4,2026-04-21,VP FUEL PARK Bangalore,3089.67,Fuel,Petrol,ICICI Emerald,ICICI_May_26,
5,2026-04-22,Fuel Surcharges Reversal,-30.56,Fuel,Reversal,ICICI Emerald,ICICI_May_26,
6,2026-04-22,IGST Fuel Surcharge Reversal,-5.50,Fuel,Reversal,ICICI Emerald,ICICI_May_26,
7,2026-04-19,CALIFORNIA BURRITO BANGALORE,293.00,Dining,Restaurant,ICICI Emerald,ICICI_May_26,
8,2026-04-22,CHAI POINT BANGALORE,212.00,Dining,Cafe,ICICI Emerald,ICICI_May_26,
9,2026-04-23,POLICYBAZAAR GURGAON,20000.02,Investment,ULIP,ICICI Emerald,ICICI_May_26,Max ULIP annual
10,2026-04-24,POLICYBAZAAR GURGAON,2584.47,Insurance,General,ICICI Emerald,ICICI_May_26,
11,2026-04-25,RAZGame Theory Bengaluru,45410.76,Entertainment,Gaming Cafe,ICICI Emerald,ICICI_May_26,
12,2026-04-30,CHAI POINT BANGALORE,188.00,Dining,Cafe,ICICI Emerald,ICICI_May_26,
13,2026-05-01,RAZDREAMPLUG PAYTECH Bengaluru,125.00,Misc,CRED,ICICI Emerald,ICICI_May_26,
14,2026-05-01,DREAMPLUG PAYTECH SO BENGALURU,80.00,Misc,CRED,ICICI Emerald,ICICI_May_26,
15,2026-05-02,DHYAN DISHES LLP BENGALURU,790.00,Dining,Restaurant,ICICI Emerald,ICICI_May_26,
16,2026-05-02,DHYAN DISHES LLP BENGALURU,240.00,Dining,Restaurant,ICICI Emerald,ICICI_May_26,
17,2026-04-30,AIRASIA_D7 SINGAPORE,89865.00,Travel,Flights,ICICI Emerald,ICICI_May_26,International
18,2026-05-03,DCC Fee,1797.30,Travel,Forex Fee,ICICI Emerald,ICICI_May_26,
19,2026-05-03,IGST on DCC Fee,323.51,Travel,Forex Tax,ICICI Emerald,ICICI_May_26,
20,2026-05-03,HANUMAN RAM DEWASI BANGALORE,2000.00,Misc,Personal Service,ICICI Emerald,ICICI_May_26,
21,2026-05-03,SGMPL WHISPERING PETA BANGALORE,200000.00,Investment,Home,ICICI Emerald,ICICI_May_26,Property investment
22,2026-05-04,ICICILOMBARD PUNE,8774.02,Insurance,General,ICICI Emerald,ICICI_May_26,
23,2026-05-06,REWARD 360 GLOBAL SERV BANGALORE,24495.60,Grocery,Bulk Grocery,ICICI Emerald,ICICI_May_26,User-tagged as Grocery
24,2026-05-07,SCHOOLAY TECHNOLOGI Bangalore,2853.00,Education,School,ICICI Emerald,ICICI_May_26,
25,2026-05-08,PRADHAN MANTRI BHARTI BANGALORE,2435.00,Medical,PM Scheme,ICICI Emerald,ICICI_May_26,
26,2026-05-09,GOODGUDI RETAIL PVT LT BANGALORE,218.00,Shopping,Retail,ICICI Emerald,ICICI_May_26,
27,2026-05-11,REWARD 360 GLOBAL SERV BANGALORE,41620.00,Travel,Hotel,ICICI Emerald,ICICI_May_26,
28,2026-05-12,Zudio BENGALURU,2396.00,Shopping,Apparel,ICICI Emerald,ICICI_May_26,
29,2026-05-12,HANUMAN RAM DEWASI BANGALORE,1200.00,Misc,Personal Service,ICICI Emerald,ICICI_May_26,
30,2026-05-13,ELITE SQUAD GYMNASTIC BANGALORE,8400.00,Education,Fitness,ICICI Emerald,ICICI_May_26,
31,2026-05-13,GANESH MEDICALS BANGALORE,400.00,Medical,Pharmacy,ICICI Emerald,ICICI_May_26,
32,2026-05-14,VP FUEL PARK Bangalore,2395.09,Fuel,Petrol,ICICI Emerald,ICICI_May_26,
33,2026-05-15,Fuel Surcharges Reversal,-23.69,Fuel,Reversal,ICICI Emerald,ICICI_May_26,
34,2026-05-15,IGST Fuel Surcharge Reversal,-4.26,Fuel,Reversal,ICICI Emerald,ICICI_May_26,
35,2026-05-15,MC DONALDS HUNSUR,284.04,Dining,Restaurant,ICICI Emerald,ICICI_May_26,
36,2026-05-17,CLUB MAHINDRA VIRAJPET,5820.16,Travel,Resort,ICICI Emerald,ICICI_May_26,
37,2026-04-24,POLICYBAZAAR GURGAON,1012.88,Insurance,General,ICICI Emerald 0107,ICICI_May_26,
`,
  planned_budget: `id,category,subcategory,monthly,annual,payment_mode,notes
1,Grocery,Milk,4000,48000,Cash,
2,Grocery,Grocery,10000,120000,Cash,
3,Grocery,Vegetables,2000,24000,Cash,
4,Grocery,Fruits,5000,60000,Cash,
5,Grocery,Vegetables Extra,1000,12000,Cash,
6,Grocery,Akshaykalpa,1000,12000,Cash,
7,Grocery,Water,800,9600,Cash,
8,Utility,Wifi,1450,17400,Card,
9,SIP,SSY,12000,144000,Cash,
10,SIP,PPF,12000,144000,Cash,
11,SIP,Committee,20000,240000,Cash,
12,Utility,IGL Gas,900,10800,Solar,
13,Utility,Mobile,250,3000,Card,
14,Utility,Electricity,500,6000,Solar,
15,Medical,Medicine,10000,120000,Card,
16,Fuel,Petrol,4000,48000,Card,
17,Dining,Office Lunch,1500,18000,Cash,
18,Dining,Weekend Munching,2500,30000,Cash,
19,Medical,Doctor,5000,60000,Card,
20,Maid,Maid + Car Cleaning,3700,44400,Cash,
21,Loan,Home Loan,21500,258000,Cash,
22,Rent,House Rent,35000,420000,Cash,
23,Loan,Personal Loan,8500,102000,Cash,
24,Insurance,Max ULIP,1667,20000,Card,Annual one-time
25,Insurance,Term Insurance,5500,66000,Card,
26,Investment,Gold,833,10000,Card,
27,Investment,NPS,4167,50000,Card,
28,Insurance,Car Insurance,1000,12000,Card,
29,Insurance,Ruby LIC,2000,24000,Card,
30,Service,Car Service,1000,12000,Card,
31,Education,School Fees,25000,300000,Card,
32,Loan,HDFC 30 RD,2500,30000,Card,
33,Service,La Maintenance,3300,39600,Card,
34,Travel,Flights,4167,50000,Card,
35,Travel,Hotels,2083,25000,Card,
36,Shopping,Apparel,6250,75000,Card,
37,Entertainment,Discretionary,2000,24000,Card,
`,
  future_projections: `id,year,age,phase,total_assets_lakh,annual_expense_lakh,annual_income_lakh,net_change_lakh,notes
1,2023,37,Earning,66,12,,,Initial year
2,2024,38,Earning,72.26,12.72,,6.26,
3,2025,39,Earning,134.36,13.48,,62.10,
4,2026,40,Earning,170.06,14.29,,35.70,
5,2027,41,Earning,209.48,15.15,,39.42,
6,2028,42,Earning,253.02,16.06,,43.54,
7,2029,43,Earning,301.12,17.02,,48.10,
8,2030,44,Earning,354.28,18.04,,53.16,
9,2031,45,Earning,413.04,19.12,,58.76,
10,2032,46,Earning,478.03,20.27,,64.99,
11,2033,47,Earning,549.91,21.49,,71.88,
12,2034,48,Earning,629.45,22.78,,79.54,
13,2035,49,Earning,717.50,24.15,,88.05,
14,2036,50,Earning,814.99,25.60,,97.49,
15,2037,51,Earning,922.93,27.14,,107.94,
16,2038,52,Earning,1042.51,28.77,,119.58,
17,2039,53,Earning,1175.02,30.50,,132.51,
18,2040,54,Earning,1321.90,32.33,,146.88,
19,2041,55,Earning,1484.74,34.27,,162.84,
20,2042,56,Earning,1665.32,36.33,,180.58,
21,2043,57,Earning,1865.63,38.51,,200.31,
22,2044,58,Earning,2087.90,40.82,,222.27,
23,2045,59,Earning,2334.57,43.27,,246.67,
24,2046,60,Earning,2608.39,45.87,,273.82,
25,2047,61,Retirement,2764.89,49.08,,156.50,Retirement phase begins
26,2048,62,Retirement,2878.76,52.52,,113.87,
27,2049,63,Retirement,2995.81,56.20,,117.05,
28,2050,64,Retirement,3115.99,60.13,,120.18,
29,2051,65,Retirement,3239.21,64.34,,123.22,
30,2052,66,Retirement,3365.36,68.84,,126.15,
31,2053,67,Retirement,3494.31,73.66,,128.95,
32,2054,68,Retirement,3625.89,78.82,,131.58,
33,2055,69,Retirement,3759.89,84.34,,134.00,
34,2056,70,Retirement,3896.08,90.24,,136.19,
35,2057,71,Retirement,4034.19,96.56,,138.11,
36,2058,72,Retirement,4173.89,103.32,,139.70,
37,2059,73,Retirement,4314.80,110.55,,140.91,
38,2060,74,Retirement,4456.51,118.29,,141.71,
39,2061,75,Retirement,4598.51,126.57,,142.00,
40,2062,76,Retirement,4740.26,135.43,,141.75,
41,2063,77,Retirement,4881.12,144.91,,140.86,
42,2064,78,Retirement,5020.38,155.05,,139.26,
43,2065,79,Retirement,5157.25,165.90,,136.87,
44,2066,80,Late Retirement,5290.83,177.51,,133.58,Advanced age phase
45,2067,81,Late Retirement,5420.12,189.94,,129.29,
46,2068,82,Late Retirement,5543.99,203.24,,123.87,
47,2069,83,Late Retirement,5661.20,217.47,,117.21,
48,2070,84,Late Retirement,5770.35,232.69,,109.15,
49,2071,85,Late Retirement,5869.92,248.98,,99.57,
50,2072,86,Late Retirement,5958.20,266.41,,88.28,
51,2073,87,Late Retirement,6033.30,285.06,,75.10,
52,2074,88,Late Retirement,6093.13,305.01,,59.83,
53,2075,89,Late Retirement,6135.41,326.36,,42.28,
54,2076,90,Late Retirement,6157.59,349.21,,22.18,Peak assets
55,2077,91,Decline,6156.88,373.65,,-0.71,Decline begins
56,2078,92,Decline,6130.22,399.81,,-26.66,
57,2079,93,Decline,6074.23,427.80,,-55.99,
58,2080,94,Decline,5985.22,457.75,,-89.01,
59,2081,95,Decline,5859.12,489.79,,-126.10,
60,2082,96,Decline,5691.49,524.08,,-167.63,
61,2083,97,Decline,5477.45,560.77,,-214.04,
62,2084,98,Decline,5211.68,600.02,,-265.77,
63,2085,99,Decline,4888.36,642.02,,-323.32,
64,2086,100,Decline,4501.12,686.96,,-387.24,Centenarian
65,2087,101,Decline,4081.15,735.05,,-419.97,
66,2088,102,Decline,3580.33,786.50,,-500.82,
67,2089,103,Decline,2989.40,841.56,,-590.93,
68,2090,104,Decline,2298.19,900.47,,-691.21,
69,2091,105,Decline,1495.56,963.50,,-802.63,Final year projected
`,
  projection_segments: `id,name,type,monthly_amount,annual_amount,yoy_growth_pct,return_pct,start_year,end_year,current_balance,notes
1,Salary,income,0,1500000,8,0,2026,2046,0,Annual net salary - edit to your value
2,Bonus,income,0,600000,8,0,2026,2046,0,Annual bonus
3,Rental Income,income,0,0,5,0,2030,2090,0,Future rental from properties
4,Business,investment,0,0,5,12,2026,2046,0,Direct business investments (AVANZAR etc.) - speculative
5,Equity,investment,0,60000,8,12,2026,2046,20000,Mutual funds + stocks + ULIP. Aim 12% long-term
6,FD / Fixed Income,investment,0,300000,5,7.3,2026,2046,1004000,PPF + SSY + RDs combined. PPF/SSY cap at 1.5L each
7,Gold,investment,0,10000,5,8,2026,2046,3722000,Physical gold + Sovereign Gold Bonds (SGBs)
8,Retirement (PF + NPS),investment,0,150000,5,9,2026,2046,1232000,EPF + NPS combined contributions
9,Real Estate,investment,0,258000,0,6,2026,2040,7693000,Home loan EMI principal portion + market appreciation
10,Living Expenses,expense,72400,0,6,0,2026,2090,0,Grocery + Utilities + Misc monthly recurring
11,House Rent,expense,35000,0,6,0,2026,2090,0,Rent grows with inflation
12,Home Loan EMI,expense,21500,0,0,0,2026,2040,0,Fixed EMI until 2040
13,Personal Loan EMI,expense,8500,0,0,0,2026,2040,0,Fixed EMI until 2040
14,School Fees,expense,25000,0,8,0,2026,2040,0,Education inflation high - until kid graduates
15,Travel & Discretionary,expense,0,175000,7,0,2026,2080,0,Annual lumpy travel + shopping
16,Insurance Premiums,expense,0,90000,5,0,2026,2080,0,Term + Car + Ruby LIC etc
17,Pension Annuity,investment,0,0,0,6,2049,2090,0,Mandatory 40% of NPS at age 60 (low return low vol)
`,
  projection_segment_yearly: `id,segment_id,year,annual_amount,return_pct,notes
`,
  actual_overrides: `id,period,category,amount,notes
`,
  goals: `id,name,target_year,target_amount,current_allocation,monthly_contribution,expected_return_pct,priority,linked_segment,notes
1,Retirement Corpus,2046,65000000,5000000,150000,8,high,Retirement (PF + NPS),25x annual expense at retirement
2,Daughter's Higher Education,2040,10000000,250000,15000,7.6,high,FD / Fixed Income,SSY maturity + dedicated SIP
3,Home Upgrade / Repair,2032,5000000,0,20000,9,medium,Equity,Property repair / 2nd property downpayment
4,Foreign Travel Fund,2030,2000000,0,12000,8,low,Equity,Annual international trips
5,Daughter's Wedding,2050,5000000,0,8000,8,medium,Gold,Long-horizon gold + equity blend
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
16,category,SIP,,
17,category,Misc,,
18,category,Reversal,,
19,category,Bonus,,
20,subcategory,Restaurant,Dining,
21,subcategory,Cafe,Dining,
22,subcategory,Office Lunch,Dining,
23,subcategory,Weekend Munching,Dining,
24,subcategory,Petrol,Fuel,
25,subcategory,Movies,Entertainment,
26,subcategory,Gaming Cafe,Entertainment,
27,subcategory,Media,Entertainment,
28,subcategory,Flights,Travel,
29,subcategory,Hotels,Travel,
30,subcategory,Resort,Travel,
31,subcategory,Local Transport,Travel,
32,subcategory,Forex Fee,Travel,
33,subcategory,Forex Tax,Travel,
34,subcategory,General,Insurance,
35,subcategory,Term Insurance,Insurance,
36,subcategory,Car Insurance,Insurance,
37,subcategory,Ruby LIC,Insurance,
38,subcategory,Health Insurance,Insurance,
39,subcategory,Home,Investment,
40,subcategory,ULIP,Investment,
41,subcategory,Gold,Investment,
42,subcategory,NPS,Investment,
43,subcategory,PPF,Investment,
44,subcategory,SSY,Investment,
45,subcategory,Equity SIP,Investment,
46,subcategory,Pharmacy,Medical,
47,subcategory,Doctor,Medical,
48,subcategory,PM Scheme,Medical,
49,subcategory,Medicine,Medical,
50,subcategory,Apparel,Shopping,
51,subcategory,Retail,Shopping,
52,subcategory,Electronics,Shopping,
53,subcategory,Bulk Grocery,Grocery,
54,subcategory,Milk,Grocery,
55,subcategory,Vegetables,Grocery,
56,subcategory,Fruits,Grocery,
57,subcategory,Water,Grocery,
58,subcategory,Mobile/Broadband,Utility,
59,subcategory,Wifi,Utility,
60,subcategory,IGL Gas,Utility,
61,subcategory,Electricity,Utility,
62,subcategory,Mobile,Utility,
63,subcategory,School,Education,
64,subcategory,Fitness,Education,
65,subcategory,Higher Ed,Education,
66,subcategory,Coaching,Education,
67,subcategory,Maid + Car Cleaning,Maid,
68,subcategory,Car Service,Service,
69,subcategory,La Maintenance,Service,
70,subcategory,Home Loan,Loan,
71,subcategory,Personal Loan,Loan,
72,subcategory,HDFC 30 RD,Loan,
73,subcategory,House Rent,Rent,
74,subcategory,Committee,SIP,
75,subcategory,CRED,Misc,
76,subcategory,Personal Service,Misc,
77,card,ICICI Emerald,,
78,card,ICICI Emerald 0107,,
79,card,SBI Cashback,,
80,card,Axis Airtel,,
81,card,HDFC Rupay,,
82,card,HSBC,,
83,card,IDFC,,
84,card,Cash,,
85,card,UPI,,
86,card,Bank Transfer,,
87,card,Manual,,
`,
  reward_targets: `id,category,best_card,monthly_spend,reward_rate_pct,annual_reward_target
1,Grocery & Utilities,Emerald,14000,3.0,2520
2,Grocery Bulk,HSBC,10000,1.0,1000
3,Insurance Payments,Emerald,25500,3.0,765
4,Medical/Shopping,Emerald,10000,3.0,900
5,Utilities,Axis,2900,8.0,232
6,Gold Diwali,Emerald,10000,3.0,900
7,Education Part 1,Emerald,65000,2.0,1000
8,La Maintenance,Emerald,39600,3.0,1188
9,Gold Annual,Emerald,100000,18.0,18000
10,Ruby Insurance,Emerald,24000,3.0,720
11,Dining Annual,Emerald,5000,3.0,900
12,HDFC 30 RD,Emerald,30000,3.0,900
13,Education Part 2,Emerald,60000,3.0,1000
14,NPS,Emerald,50000,1.5,750
15,Fuel,Emerald,36000,0.0,0
16,Car Insurance + Service,Emerald,24000,3.0,720
17,Flight,Emerald,50000,18.0,9000
18,Hotel,Emerald,25000,36.0,9000
`
};
