# WIJHA v2 — final pixel + copy score

Mismatch = share of pixels whose max channel delta > 32 (`compare.py`), app vs the 1x Figma export, after the global shell polish. Brackets: change vs the area summaries before the polish (`out/before/summary-*.md`). Text = `textcheck.py --pair` exact/total Figma strings found on the page.

**Average mismatch — Arabic 2.98% over 64 frames, English 3.78% over 63 frames.**  
Same frames before → after: Arabic 3.39% → 2.99% (63 frames), English 4.35% → 3.80% (62 frames).

| area | route | AR frame | AR mismatch | EN frame | EN mismatch | AR text exact | EN text exact |
|---|---|---|---|---|---|---|---|
| home | `#/` | 2013:5689 | 3.02% (-0.12) | 5233:29613 | 4.58% (-0.02) | 101/104 | 105/108 |
| home | `#/?hero=learning` | 2227:5149 | 4.46% (-0.55) | 5233:30272 | 6.31% (-0.69) | 100/101 | 105/107 |
| home | `#/?hero=news` | 2227:5897 | 6.29% (-0.53) | 5233:30885 | 7.83% (-0.68) | 100/101 | 100/101 |
| home | `#/?hero=weather` | 2227:6645 | 4.44% (-0.55) | 5233:31472 | 6.01% (-0.69) | 100/101 | 104/106 |
| home | `#/?assistant=1` | 315:680 | 4.54% (-0.20) | 5233:29033 | 5.58% (-0.16) | 93/94 | 93/94 |
| home | `#/notifications` | 4693:23706 | 1.63% (-0.20) | 5233:18324 | 2.40% (-0.27) | 13/14 | 13/17 |
| employee | `#/profile` | 4791:33007 | 3.06% (-0.46) | 5233:18420 | 3.65% (-0.53) | 21/26 | 22/25 |
| employee | `#/employee` | 2028:760 | 2.73% (-0.33) | 5233:19957 | 4.22% (-0.46) | 56/77 | 55/76 |
| employee | `#/leave/request` | 4871:16776 | 1.76% (-0.18) | 5233:20303 | 2.67% (-0.28) | 12/17 | 12/17 |
| work | `#/calendar` | 2493:3720 | 2.20% (-0.39) | 5233:18840 | 2.90% (-0.51) | 90/92 | 87/89 |
| work | `#/calendar?view=day` | 2521:6688 | 1.77% (-0.28) | 5233:19252 | 2.27% (-0.36) | 68/71 | 66/69 |
| work | `#/calendar?view=month` | 2580:3222 | 2.69% (-0.37) | 5233:19578 | 3.34% (-0.46) | 55/61 | 54/58 |
| work | `#/tasks` | 2015:9895 | 3.04% (-0.15) | 5233:22494 | 4.21% (-0.45) | 43/66 | 45/71 |
| work | `#/projects/p2` | 3580:8261 | 2.67% (-0.26) | 5233:23043 | 3.67% (-1.14) | 46/63 | 43/62 |
| work | `#/tasks/w1` | 3580:8521 | 2.93% (-0.40) | 5233:23315 | 4.47% (-0.36) | 30/41 | 29/41 |
| work | `#/projects/p2?edit=1` | 3580:8667 | 2.61% (-0.24) | 5233:23479 | 3.63% (-0.38) | 43/66 | 41/65 |
| work | `#/tasks/w1?edit=1` | 3580:8965 | 2.12% (-0.33) | 5233:23789 | 3.06% (-0.33) | 26/43 | 26/43 |
| services | `#/services` | 2028:1506 | 2.11% (-0.20) | 5233:24435 | 2.61% (-0.48) | 64/64 | 64/64 |
| services | `#/services/catalog/it` | 3039:5370 | 1.68% (-0.17) | 5233:24866 | 2.09% (-0.25) | 19/19 | 19/19 |
| services | `#/services/catalog/hospitality` | 4915:18256 | 0.89% (-0.13) | 5233:25971 | 1.08% (-0.19) | 9/11 | 9/11 |
| services | `#/services/catalog/it/technical` | 3054:6015 | 0.84% (-0.10) | 5233:25685 | 1.16% (-0.19) | 9/9 | 9/9 |
| services | `#/services/catalog/it/technical?group=devices` | 3054:6317 | 1.14% (-0.11) | 5233:25748 | 1.50% (-0.20) | 10/10 | 10/10 |
| services | `#/services/request/printers` | 4661:13733 | 0.69% (-0.14) | 5233:25855 | 0.98% (-0.21) | 4/5 | 4/7 |
| services | `#/services/catalog/it/report-fault` | 4851:15277 | 1.04% (-0.19) | — | — | 6/7 | — |
| services | `#/services/history` | 4777:25710 | 1.09% (-0.23) | 5233:25928 | 1.37% (-0.34) | 23/23 | 23/23 |
| services | `#/services/health?period=monthly` | 3056:6882 | 2.51% (-0.24) | 5233:25013 | 2.89% (-0.36) | 41/54 | 52/54 |
| services | `#/services/health?period=weekly` | 3056:7394 | 2.67% (-0.23) | 5233:25298 | 2.95% (-0.36) | 35/49 | 33/47 |
| services | `#/services/health?period=daily` | 3056:7978 | 2.36% (-0.23) | 5233:25523 | 2.65% (-0.29) | 23/37 | 23/37 |
| services | `#/cafeteria?basket=demo` | 4915:17913 | 1.28% (-0.13) | 5233:26973 | 2.15% (-0.17) | 17/19 | 17/19 |
| services | `#/services/hospitality/waiter` | 4915:18193 | 0.59% (-0.13) | 5233:26599 | 0.90% (-0.17) | 3/4 | 3/4 |
| services | `#/services/violations` | 4999:17400 | 0.89% (-0.10) | 5233:26046 | 1.23% (-0.18) | 5/5 | 5/5 |
| services | `#/services/violations?group=investigation` | 4999:17869 | 0.82% (-0.11) | 5233:26117 | 1.16% (-0.18) | 4/4 | 4/4 |
| services | `#/services/violations/new` | 4946:15932 | 1.84% (-0.25) | 5233:26645 | 2.58% (-0.47) | 6/9 | 8/9 |
| services | `#/services/violations/new?policy=accepted` | 5003:19354 | 1.88% | 5233:26765 | 2.64% | 6/9 | 8/9 |
| services | `#/services/violations/reports` | 4999:18052 | 1.17% (-0.25) | 5233:26885 | 2.18% (-0.32) | 15/16 | 16/16 |
| services | `#/services/violations/queue` | 4999:19203 | 1.35% (-0.29) | 5233:26924 | 1.79% (-0.43) | 14/15 | 15/15 |
| services | `#/services/violations/reports/BSRITM-0118845` | 4999:18721 | 1.94% (-0.27) | 5233:26172 | 2.80% (-0.38) | 41/50 | 46/51 |
| services | `#/services/violations/queue/BSRITM-0118845` | 5005:19655 | 2.04% (-0.27) | 5233:26368 | 2.88% (-0.40) | 39/51 | 44/51 |
| knowledge | `#/documents?as=admin` | 2028:3744 | 7.24% (-0.30) | 5233:17464 | 8.31% (-1.39) | 48/52 | 48/52 |
| knowledge | `#/news/n0?as=admin` | 4758:25023 | 27.40% (-2.54) | 5233:17816 | 26.93% (-2.52) | 7/8 | 7/8 |
| knowledge | `#/announcements/a0` | 4758:25160 | 20.41% (-6.65) | 5233:17856 | 20.11% (-6.82) | 4/6 | 4/6 |
| knowledge | `#/intelligence` | 2028:2252 | 1.81% (-0.21) | 5233:18536 | 2.92% (-0.37) | 7/17 | 7/17 |
| knowledge | `#/intelligence?files=1` | 4858:15788 | 1.92% (-0.22) | 5233:18679 | 3.02% (-0.38) | 11/21 | 11/21 |
| knowledge | `#/learning` | 2028:5236 | 2.85% (-0.27) | 5233:20651 | 4.15% (-0.39) | 54/56 | 53/55 |
| operations | `#/operations?state=empty` | 3907:9016 | 1.74% (-0.26) | 5233:27254 | 3.31% (-0.38) | 28/33 | 36/39 |
| operations | `#/operations?state=create` | 4124:11249 | 1.82% (-0.28) | 5233:27455 | 3.52% (-0.41) | 28/34 | 36/40 |
| operations | `#/operations` | 4124:11545 | 2.20% (-0.34) | 5233:27685 | 4.49% (-0.49) | 46/52 | 54/58 |
| operations | `#/operations/checklists/r1?state=draft` | 4124:12320 | 2.51% (-0.50) | 5233:27946 | 2.89% (-0.83) | 7/9 | 8/11 |
| operations | `#/operations/delegation/new` | 4124:9654 | 1.70% (-0.19) | 5233:28027 | 2.23% (-0.35) | 6/10 | 8/10 |
| operations | `#/operations/incentives` | 4124:10275 | 1.19% (-0.20) | 5233:28137 | 1.65% (-0.35) | 17/20 | 17/20 |
| operations | `#/operations/evaluations` | 4124:10533 | 2.74% (-0.39) | 5233:28184 | 3.15% (-0.47) | 44/46 | 43/48 |
| operations | `#/operations/evaluations/employee/e1` | 4124:12781 | 2.20% (-0.27) | 5233:28448 | 2.67% (-0.37) | 29/30 | 29/32 |
| operations | `#/operations/evaluations/ev-e1-1` | 4124:13130 | 1.96% (-0.10) | 5233:28552 | 2.34% (-0.40) | 4/5 | 5/5 |
| operations | `#/operations/personal` | 4124:10928 | 0.81% (-0.13) | 5233:28587 | 1.11% (-0.25) | 4/4 | 4/4 |
| operations | `#/operations/personal/goals` | 4124:13741 | 1.67% (-0.29) | 5233:28852 | 2.27% (-0.46) | 16/17 | 17/17 |
| operations | `#/operations/personal/history` | 4124:13384 | 1.68% (-0.28) | 5233:28651 | 2.05% (-0.41) | 10/11 | 10/10 |
| operations | `#/operations/personal/half-year` | 4124:13576 | 1.45% (-0.22) | 5233:28681 | 1.82% (-0.37) | 8/8 | 8/11 |
| operations | `#/operations/personal/annual` | 4126:14074 | 1.41% (-0.22) | 5233:28720 | 1.83% (-0.36) | 8/8 | 8/11 |
| operations | `#/operations/personal/operational-log` | 4215:13599 | 2.70% (-0.41) | 5233:28328 | 3.12% (-0.50) | 35/46 | 43/46 |
| operations | `#/operations/evaluate` | 4126:14560 | 1.27% (-0.17) | 5233:28800 | 1.53% (-0.30) | 7/9 | 7/11 |
| operations | `#/operations/evaluate/t3` | 4126:14408 | 1.93% (-0.30) | 5233:28759 | 2.44% (-0.47) | 10/10 | 9/12 |
| home | `#/?notifications=1` | 2146:3946 | 5.15% (-0.26) | 5233:32088 | 7.07% (-0.52) | 123/124 | 126/127 |
| home | `#/?search=1` | 2159:2117 | 4.75% (-0.39) | 5233:32885 | 6.22% (-0.47) | 105/107 | 107/111 |
| home | `#/?employee=e-khaled` | 4263:19954 | 5.27% (-0.46) | 5233:21129 | 6.67% (-0.50) | 112/115 | 120/128 |

## Regressions > 0.3pp

None.
