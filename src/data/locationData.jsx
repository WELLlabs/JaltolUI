
export const selectedState = 'Rajasthan'; // Hardcoded for now

export const districtDisplayNames = {
    'karauli': 'Karauli, RJ',
};

export const subdistrictByDistrict = {
    'karauli': ['Todabhim', 'Nadoti', 'Hindaun', 'Karauli', 'Mandrail', 'Sapotra']
}

export const villagesBySubDistrict = {
    'todabhim': [
        'anatpura', 'bhanakpura', 'bhaiseena', 'tudawali', 'bhajera', 'dantli', 'mehandipur', 'gahroli', 'sankarwara',
        'bhooda', 'parla khalsa', 'parla jageer', 'shankarpur dorka', 'sarsena chak no-1', 'muthepur', 'jhareesa',
        'bhaisapatti khurd', 'bhaisapatti kalan', 'choorpura', 'madhopura', 'matasoola', 'parli khurd', 'jodhpura',
        'khirkhiri', 'nangal mandal', 'vishanpura charan', 'azizpur', 'mirzapur', 'gopalpura', 'mahendwara', 'asro',
        'makbara', 'kaneti', 'bheempur', 'sujanpura', 'sehrakar', 'dadanpur', 'mannauj', 'nandipur', 'trishool',
        'jhunki', 'jaisni', 'kheri', 'mereda', 'turakpur', 'manderoo', 'gazipur', 'chak gazipur', 'kheriya', 'dorawali',
        'kamalpuriya ka pura', 'jonl', 'vishan pura', 'bonl', 'kariri', 'khanpur', 'fatehpur', 'mohanpur', 'bholooki kothi',
        'balawas', 'kudhawal', 'shankarpur', 'nangal sultanpur', 'faujipur', 'badleta khurd', 'machri', 'beejalwara', 'ladpur',
        'edalpur', 'bhandari androoni', 'rajor', 'makhthot', 'monapura', 'khohra', 'padampura', 'gajjupura', 'bairoj', 'gorda',
        'rajoli', 'dhawan', 'nand', 'mohanpura', 'gaonri', 'kamalpura', 'jahannagar morda', 'bhandari berooni', 'nangal sherpur',
        'balghat', 'penchla', 'ghatra sherpur', 'parli', 'badleta bujrg', 'baledi', 'moondiya', 'salaipura', 'majeedpura',
        'karampura', 'pat katara', 'jaisinghpura', 'jagdishpura', 'mahmadpur', 'deolen', 'nayagaon', 'peelwa', 'ranmalpara',
        'tighriya', 'mosalpur', 'chak kanwar pura', 'kanwar pura', 'lalaram ka pura', 'bhadoli', 'singhniya', 'salimpur',
        'katara aziz', 'lapawali', 'tajpur', 'kanjoli', 'pahari', 'kuteela', 'bichpuri', 'urdain', 'khilchipur meena',
        'khilchipur bara', 'barh mahasinghpura', 'luhar khera', 'chandwar', 'mahswa', 'bhotwara', 'ayyapur', 'kirwara', 'arej',
        'shekh pura', 'ranoli', 'kalwari', 'akhawara', 'gazipur', 'bahadurpur', 'bhopur', 'sahjanpur', 'nisoora'
    ],
    'nadoti': [
        'chainpura', 'meenapatti', 'rampura', 'sandera', 'rajpur', 'talchida', 'garhi', 'bara', 'timawa', 'dholeta',
        'andhiya khera', 'barh kemri', 'bheelapara', 'balakhera', 'maloopara', 'ghatoli', 'rengaspura', 'gurha chandraji',
        'gidani', 'rajahera', 'muhana', 'guna', 'bhanwarwara', 'jahra', 'machri', 'khurd', 'bhanwra', 'nayawas', 'gothra',
        'dhadanga', 'dhahariya', 'nadoti', 'sikandarpur', 'ibrahimpur', 'bara wajidpur', 'dhamadi ka pura', 'mehta ka pura',
        'maidhe ka pura', 'jindon ka pura', 'dhand ka pura', 'kaimri', 'tesgaon', 'kakala', 'bilai', 'ralawata', 'khedla',
        'ronsi', 'kemla', 'milak saray', 'kunjela', 'kherli', 'nayapura', 'baragaon', 'hodaheli', 'kaima', 'bardala',
        'jeerna', 'alooda', 'dalpura', 'jeetkipur', 'loda', 'harloda', 'pal', 'lalsar', 'bhondwara', 'ganwari', 'chirawanda',
        'dhola danta', 'garhmora', 'rupadi', 'raisana', 'garhkhera', 'khoyli', 'palri', 'salawad', 'bagor', 'bamori', 'gurli',
        'garhi khempur', 'khura chainpura', 'shahar', 'lahawad', 'sop', 'bara pichanot', 'sanwta'
    ],

    'hindaun': [
        'ghonsla', 'kherli goojar', 'atkoli', 'churali', 'pali', 'singhan jatt', 'reenjhwas', 'bai jatt', 'dhursi', 'vijaypura',
        'ber khera', 'sitapur', 'chandeela', 'gudhapol', 'mahoo ibrahimpur', 'karai', 'mahoo khas', 'mahoo dalalpur',
        'shyampur moondri', 'fazalabad', 'peepalhera', 'dhahara', 'gadhi panbheda', 'gadhi mosamabad', 'sikandarpur',
        'gopipur', 'kyarda khurd', 'patti narayanpur', 'kyarda kalan', 'rewai', 'lahchora', 'hukmi khera', 'dhindhora',
        'dhandhawali', 'suroth', 'taharpur', 'bhukrawali', 'jatwara', 'durgasi', 'kheri hewat', 'somala ratra', 'somli',
        'khijoori', 'sherpur', 'jat nagala', 'bahadurpur', 'alawara', 'bajna khurd', 'vajna kalan', 'banki', 'ekorasi',
        'mukandpura', 'barh karsoli', 'kalwari jatt', 'rara shahpur', 'hadoli', 'chinayata', 'kheep ka pura', 'kalyanpur sayta',
        'khareta', 'areni goojar', 'mothiyapur', 'jhirna', 'ponchhri', 'barh ponchhri', 'jewarwadaatak', 'bhango',
        'khohara ghuseti', 'chamar pura', 'phulwara', 'sikroda jatt', 'sikroda meena', 'kheri sheesh', 'kheri ghatam',
        'hindaun rural', 'kailash nagar', 'mandawara', 'jhareda', 'alipura', 'vargama', 'nagla meena', 'binega', 'jahanabad',
        'irniya', 'kheri chandla', 'kajanipur', 'hingot', 'banwaripur', 'gaonri', 'dubbi', 'norangabad', 'akbarpur',
        'kodiya', 'chandangaon', 'danalpur', 'kandroli', 'pataunda', 'sanet', 'khera', 'jamalpur', 'kutakpur', 'katkar',
        'reethauli', 'garhi badhawa', 'gaonda meena', 'todoopura', 'gaoda goojar', 'gunsar', 'singhan meena', 'manema',
        'kachroli', 'dedroli', 'bajheda', 'leeloti', 'kalwar meena', 'khanwara', 'kotra dhahar', 'kotri', 'kalakhana', 'palanpur'
    ],
    'karauli': [
        'sengarpura', 'ari hudpura', 'rod kalan', 'chak rod', 'rudor', 'baseri', 'ruggapura', 'jungeenpura', 'pahari',
        'kashirampura', 'gurla', 'rod khurd', 'peepalpura', 'teekaitpura', 'unche ka pura', 'chorandapura', 'sahajpur',
        'pareeta', 'raghuvanshi', 'mohanpur', 'bindapura', 'nayawas', 'jagatpura', 'barh gulal', 'jahangeerpur', 'deeppura',
        'dafalpur', 'makanpur', 'barh dulhepal', 'bharka', 'beejalpur', 'pator', 'manthai', 'daleelpur', 'paitoli', 'saipur',
        'keeratpura', 'hajaripura', 'dahmoli', 'tulsipura', 'kharenta', 'birwas', 'deeppura', 'balloopura', 'agarri', 'silpura',
        'manchi', 'bhaisawat', 'shankarpur', 'pahari meeran', 'makanpur chaube', 'konder', 'sohanpura', 'chainpur', 'ummedpura',
        'gadoli', 'fatehpur', 'mengra kalan', 'ledor kalan', 'mengra khurd', 'manda khera', 'hakimpura', 'kheriya', 'goojar bhavli',
        'narayana', 'malpur', 'keshrisingh ka pura', 'rajanipura', 'pejpura', 'seeloti', 'unchagaon', 'madanpur', 'khera rajgarh',
        'sakarghata', 'kumherpur', 'pura auodarkhan', 'lakhnipur', 'bhaua', 'nayawas', 'neemripura', 'dukawali', 'barwatpura',
        'garhi', 'meola', 'chavadpura', 'tali', 'sadpura', 'peepal kherla', 'danda', 'nawlapura', 'timkoli', 'jamoora', 'umri',
        'siganpur', 'mangrol', 'alampur', 'kanchanpur with talhati', 'singniya', 'farakpur', 'bhojpur', 'virhati', 'garh mandora',
        'sewli', 'birhata', 'daudpur', 'piprani', 'deori', 'khooda', 'khoondri', 'keshpura', 'aneejara', 'munshipura', 'rohar',
        'masalpur', 'rughpura', 'mardai khurd', 'khanpura', 'mardai kalan', 'bhood khera', 'lotda', 'sahanpur', 'kasara', 'bhavli',
        'shubhnagar', 'guwreda', 'golara', 'ledor khurd', 'bhaua khera', 'khaira', 'bhauwapura', 'bahrai', 'ratiyapura', 'chhawar',
        'kota chhawar', 'machani', 'tatwai', 'binega', 'sorya', 'kosra', 'bhoder', 'bichpuri', 'saseri', 'bhanwarpura', 'barkhera',
        'dhandhupura', 'rajpur', 'thar ka pura', 'anandgarh', 'gunesari', 'dhoogarh', 'gopalpur sai', 'rampur', 'birhati', 'kalyani',
        'mamchari', 'taroli', 'gunesra', 'manch', 'kota mam', 'harjanpura', 'barrif', 'gopalgarh', 'alampur', 'dalapura shastri',
        'pator shastri', 'reechhoti', 'wajidpur', 'barriya', 'chainpur', 'khirkhira', 'hanumanpura', 'ghurakar', 'manoharpura',
        'kashipura', 'semarda', 'gerai ki guwari', 'gangurda', 'gerai', 'lauhra', 'kailadevi', 'khohri', 'basai dulapura', 'atewa',
        'arab ka pura', 'maholi', 'bawli', 'rajor', 'karsai', 'jakher', 'akolpura', 'doodapura', 'bhikam pura', 'khoobnagar',
        'parasari', 'mahoo'
    ],
    'mandrail': [
        'garhi ka gaon', 'kanchanpur', 'batda', 'makanpur swami', 'bhankri', 'gurdah', 'naharpura', 'baharda', 'teen pokhar',
        'langra', 'bugdar', 'doylepura', 'chandeli', 'rodhai', 'gurja', 'shyampur', 'needar', 'jagadarpura', 'khirkan',
        'mogepura', 'garhwar', 'nayagaon', 'makanpur', 'bhattpura', 'bhojpur', 'mandrail', 'firojpur', 'ghatali', 'chainapura',
        'jakhauda', 'rajpur', 'pasela', 'paseliya', 'baguriyapura', 'manakhur', 'chandelipura', 'darura', 'mureela', 'ond',
        'bhorat', 'mar ka kua', 'bagpur', 'dhoreta', 'maikna', 'gopalpur', 'dargawan', 'rancholi', 'pancholi', 'nihalpur',
        'tursampur', 'ranipura', 'barred'
    ],
    'sapotra': [
        'kherla', 'neemoda', 'edalpur', 'manda', 'meenapura', 'baroda', 'gordhanpura', 'jeerota', 'dayarampura', 'narauli',
        'masawata', 'bairunda', 'harisinghpura', 'khidarpur', 'bhartoon', 'khirkhira', 'baloti', 'badh salempur', 'salempur',
        'jatwari', 'rundi', 'govindpura', 'rampur palan', 'kurgaon', 'mahmadpur', 'mandawara', 'gokalpura', 'badh sariya',
        'badh jeewansingh', 'badh kothimundha', 'badh pratapsingh', 'badh bhoodhar', 'hanjapur', 'thooma', 'dikoli khurd', 'khera',
        'lediya', 'kudawada', 'dikoli kalan', 'kachroda', 'shekhpura', 'dabra', 'sadpura', 'kanapura', 'khirkhiri', 'looloj',
        'peelodapura', 'inayati', 'jakhoda', 'aurach', 'raneta', 'jorli', 'kishorpura', 'doondipura', 'paharpura', 'adooda', 'ganwda',
        'madhorajpura', 'ekat', 'rooppura', 'pardampura', 'gadhi ka gaon', 'hadoti', 'fatehpur', 'saimarda', 'kiradi', 'bagida',
        'simar', 'khoh', 'unchi guwari', 'kala gurha', 'gorahar', 'bhandaripura', 'nisana', 'dabir', 'bookana', 'khanpur',
        'choragaon', 'dhoolwas', 'khawda', 'gajjupura', 'jori', 'tursangpura', 'gopipura', 'keeratpura', 'ratanapura', 'baluapura',
        'hariya ka mandir', 'gothra', 'suratpura', 'bapoti', 'mangrol', 'lokeshnagar', 'mijhaura', 'ada doongar', 'amarwar',
        'narauli', 'bajna', 'budha bajna', 'ramthara', 'amargarh', 'doodha ki guwari', 'matoriya ki guwari', 'daulatpura',
        'nainiya ki guwari', 'patipura', 'raseelpur jaga', 'marmada', 'raibeli jagman ki', 'khijoora', 'veeram ki guwari',
        'nibhaira', 'moraichi', 'rawatpura', 'baharda', 'choriya khata', 'chorka khurd', 'chorka kalan', 'kanarda', 'chacheri',
        'maharajpura', 'hasanpura', 'gota', 'chaurghan', 'bharrpura', 'amarapur', 'asha ki guwari', 'mahal dhankri', 'bhaironpura',
        'nanpur', 'chirchiri', 'manki', 'kamokhari', 'dongri', 'dangariya', 'kankra', 'karanpur', 'ghusai', 'garhi ka gaon', 'karai',
        'rahir', 'alwat ki guwari', 'chaube ki guwari', 'bahadarpur', 'mandi bhat', 'sonpura', 'raibeli mathuraki', 'amre ki guwari',
        'koorat ki guwari', 'chirmil', 'arora', 'manikpura', 'toda', 'simara', 'kased'
    ]


};