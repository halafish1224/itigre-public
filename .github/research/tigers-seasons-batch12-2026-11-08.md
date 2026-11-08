# 1990–1998 user screenshots → ten-season roster archive (batch12)

Base b70f1bf2f49a5b22cb2472ab21d9ce7c1fcd196e, itigre-public/main. The public wiki URL returned an Anubis block in batch11. This batch does NOT fetch/bypass the blocked page: the user supplied the nine missing annual screenshots, which are the transcription source. Metadata/forewords outside the roster are not copied. No uploaded screenshots or external article photos are included in the repository/site. No Library copy needed for a Git-backed website.

## Exact source ordering

| Year | User file | Source main-list entries |
|---|---|---:|
|1990|1000013902.png|23|
|1991|1000013900.png|30|
|1992|1000013898.png|27|
|1993|1000013896.png|22|
|1994|1000013894.png|30|
|1995|1000013892.png|31|
|1996|1000013890.png|34|
|1997|1000013888.png|38|
|1998|1000013886.png|43|

1999was built from1794121053192.png in batch11 (35main names). Full transcription including staff, supplemental names, practice/loan markers, original grouping: `tigers-season-rosters-1990-1998.json` alongside this note. Counts above are literal primary-roster group entries, NOT independent official appearance counts, and exclude supplementary/practice lists. Do not add the annual counts and call that unique players.

## Critical scope distinctions

-1990曹清來 practice status separate from added寶力/林仲秋. A later source suggests actual1990appearances, but this batch does not alter the screenshot's practice designation or publish career statistics/alias/death details.
-1991new registrations repeat main-list names; do not double count them.
-1992source spells秘力. Do not silently merge it with必可,祕力, or any guessed English name. No external identification assigned. 應 use correct鷹俠 from supplied image.
-1993main table lists陳友彬asmanager; introductorynote saysmanagerhandoverwithinseason—don't claimheheldallseason. Trading with陳長陽/侯明坤 was in preparation for expansion; exact transactiondate differs between retrospective/year grouping. New profile avoids a precise transactionyear/day claim, says expansion-period exchange. CPBL2002 article labels職棒四年; contemporary source surfaced viaPTTreprint appears1992 and needsdirectdateverification.
-1993newcomer field contains全家福 twice. Public page keeps one displayed name, explicitly notes duplicate and explains TWO recruit identities usingSportsV114107page2: VladimirPerez originally planned but didnotarrive; RafaelValdez actualreplacement. Do NOT count the duplicate as either two confirmed Tigers game participants or prove one person twice. Index is Chinese registrationNAME index, not unique-human index.
-1994大漢/華力 are春訓隨隊, separate frommainroster; not confirmed appearances. No standalone profile or stats inferred.
-1995image visibly runs賀西、華司across line/spacing; theseareseparatepitchers. Independentsupport https://www.sportsv.net/articles/71602?page=2 explicitly listsboth. No guessedcombined賀西華司person.
-1996陳長陽source explicitseasontransfer-to-味全 note retained. No inference ofwhole-season presence for侯明坤orothers.
-1997five%loans are楊福群、沈俊忠、許錫華、何良志、孫家濬. Source says下半季借至二代鷹; retainallfive, separate from permanenttransfer. Do NOT merge孫光義/孫家濬withoutverifiedidentity; do NOT merge豪帥/豪壯justbecausehomophonic.
-1998source places巧克力inIF while existingprofileisOF; explicitly source-specific grouping. Samefor藍文成/黃世明/許錫華acrossyears and林仲秋. Do not rewrite official biography guardpositions basedonlythisroster.
-136unique displayedNAME labels across10annualtables, inclsupplements/practice.65exactname matches to65profiles;71no-profilelabels. Notclaimed136uniquepeopleorcomplete10yearofficiallist. Missing unshown changes may exist.

## New profiles

1.陳長陽: CPBLofficial2002-12-26 https://cpbl.com.tw/xmdoc/cont?sid=0L132508612135006750 explicitly describesexchange三商侯明坤/俊國陳長陽. TCDB https://www.tcdb.com/Person.cfm/pid/213291/Chang-Yang-Chen hascardprovenance. SportsV2022-06-01一貫三 https://www.sportsv.net/articles/94826?page=2 mentionscatcher,Tigers→Dragons.1993–96annualsourcesanchorroute. No publishfullcareerdate/renamingto陳俊智/DOB/career stats/reasonsforrelease. Retrospectivedateambiguitykeptinternal.
2.巧福CesarMejia: LTN吳清正2019-03-12 https://sports.ltn.com.tw/news/paper/1273524 (datecheckedinfullpage, NOT03/11); SportsV小楓康2019-06-27 https://www.sportsv.net/articles/64512 independentlyagreeon1993first-teamgamecompletegamewinvsBrothersandwin-linkednextdaynoodlespromotion. UDN報時光2025-06-27 https://time.udn.com/udntime/story/122833/8830197 independentlysupportsmarketingtheme. Shortoriginalparaphrase,nodirectquotesorpercentdiscount/nopitchcountsorprecisescore. B-R1993row https://www.baseball-reference.com/register/player.fcgi?id=mejia-001ces has24G5W9L, but noofficialCPBLtableverified, so NOstats published. SportsV67271calls9IP2Rwhile64512narrative3R; skipscore. No MLB appearance claim.
3.陳光輝: contemporaneous聯合報林以君1997-08-16 https://catalog.digitalarchives.tw/item/00/32/11/ca.html explicitlypre-reserve→registrationasaninfielderwith洪邦政and林禮雄; samejournalist1997-08-23 https://catalog.digitalarchives.tw/item/00/32/11/e7.html corroboratesregistration. TheseareTWOcontemporaryreports, nottwoindependentstatisticaldatasets. Noappearance/career totals published;1997/1998sourcegroupsretained. No linkto1992同名youthplayerbecauseidentityunverified.

## Public implementation

-9newyearpages, all10yearnavigationincludingprevious1999,1newannualindex.
-Name/yearfilterusesonlyexistingrenderedDOM. WithoutJSallnamesvisible. NFKC+whitespacefolding,caseinsensitive,statusannouncement,noexternalrequests/storage/tracking.
-LocalsharedseasonCSS:two-columnrosters→singlecolumn620px,flexyearnavigationmin44pxtargets,focusvisible,search48px,narrownameindexstacks.
-Profiles62→65,IF20→21,P20→21,C6→7,OF14unchanged,2provisionalunchanged. Allold62cardsandprofilepathsretained.
-Same-sourceyeargrouplabelsdoNOTchangeprimaryprofileguardpositions. Mainhistoryandplayerindexlinktenseasonarchive.
-Reciprocalcontextlinks侯明坤→陳長陽,林禮雄→陳光輝. Existinganchors/links/tablespreserved.
-Sitemapadd13pages(index+9years+3profiles). ExistingpreflightalreadychecksseasonpathsandallTigersHTML.
-ResearchJSONandnotes.githubexcludedfromdeployedarchive.
