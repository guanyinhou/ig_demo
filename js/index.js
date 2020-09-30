window.onload = function() {
    var searchBar = document.getElementsByClassName("searchBar")[0];
    var searchClick = document.getElementsByClassName("searchBtn")[0];
    var moreBtn = document.getElementById("more");
    var loadingPage = document.getElementsByClassName("loading")[0];
    var popPage = document.getElementsByClassName("pop")[0];

    var keyword = ""; // 搜尋的文字
    var edges = null; // 搜尋出來的照片
    var baseUrl = ""; // api的url
    var img_html = ""; // 圖片列表
    var loading = {
        isLoading: false // loading動畫
    };
    var pageInfo = {
        has_next_page: false, // 下一頁
        end_cursor: "" // 最後一頁的hash
    };
    var photoTag = {
        pages: [] // 存取目前所有照片
    }

    // https://www.instagram.com/explore/tags/{標籤}/?__a=1&max_id={最後一頁的hash}
    // encodeURI(字串編碼) & decodeURI(轉回字串)

    // graphql.hashtag.edge_hashtag_to_media["page_info"] // 所有資料
    // graphql.hashtag.edge_hashtag_to_media["edge"]; // 所有照片
    
    // 搜尋
    // searchClick.addEventListener("touchstart", e => {
    //     e.preventDefault()
    //     console.log("touchstart event!")
    // })
    searchClick.addEventListener("click", function(e){
        e.preventDefault();
        console.log(e);
        console.log(e.path[0].previousElementSibling.value);
        let inputVal = e.path[0].previousElementSibling.value;
        // if(e.keyCode !== 13) return;
        if(inputVal === "") return;
        if(inputVal !== keyword){
            resetData();
        }
        // if(this.value === "") return;
        // if(this.value !== keyword){
        //     resetData();
        // }

        // keyword = this.value;
        // searchHashTag(this.value);
        // this.value = "";
        keyword = inputVal;
        searchHashTag(inputVal);
        inputVal = "";
    })
    searchBar.addEventListener("keyup", function(e){
        if(e.keyCode !== 13) return;
        if(this.value === "") return;
        if(this.value !== keyword){
            resetData();
        }

        keyword = this.value;
        searchHashTag(this.value);
        this.value = "";
    })
    
    // 更多結果
    moreBtn.addEventListener("click", function(){
        searchHashTag(keyword);
    })

    // 開始搜尋圖片
    function searchHashTag(keyword) {
        loading.isLoading = true;
        console.log("搜尋", keyword);
        baseUrl = `https://www.instagram.com/explore/tags/${encodeURI(keyword)}/?__a=1`;

        if(pageInfo.has_next_page) {
            baseUrl += `&max_id=${pageInfo.end_cursor}`;
        }
        console.log(baseUrl);

        axios.get(baseUrl)
        .then(res=>{
            loading.isLoading = false;
            console.log(res);
            edges = res.data.graphql.hashtag.edge_hashtag_to_media.edges;
            pageInfo = res.data.graphql.hashtag.edge_hashtag_to_media.page_info;
            photoTag.pages = edges;
        })
        .catch(err=>{
            loading.isLoading = false;
            console.dir(err);
        })
    }
    
    // 重置資料
    function resetData() {
        img_html = "";
        photoTag.pages = [];
        document.getElementsByClassName("imgBox")[0].innerHTML = "";
        document.getElementById("bar").classList.remove("searchOkay");
        moreBtn.style.display = "none";
    }
    
    // 如果資料有變動就重新整理畫面
    bindValue(photoTag, "pages", function(val){
        // img_html = "";
        val.forEach(item => {
            img_html += `<div class="imgdiv" style="background-image: url(${item.node.display_url})"></div>`;
        })
        document.querySelector(".imgBox").innerHTML = img_html;

        if(val.length !== 0) {
            document.getElementById("bar").classList.add("searchOkay");
        }

        if(pageInfo.has_next_page) {
            moreBtn.style.display = "block";
        }

        var idx = document.querySelectorAll(".imgdiv");
        idx.forEach(item => {
            item.addEventListener("click", showPop);
        })

        function showPop() {
            console.log("showPop");
            console.log(this.style.backgroundImage.replace('url("', "").replace('")', ""));
            popPage.style.display = "block";
            let imgUrl = this.style.backgroundImage.replace('url("', "").replace('")', "");
            document.getElementsByClassName("popImg")[0].src = imgUrl;
        }
    })
    
    // loading資料變動
    bindValue(loading, "isLoading", function(bool){
        if(bool) {
            loadingPage.style.display = "block";
        } else {
            loadingPage.style.display = "none";
        }
    })

    popPage.addEventListener("click", function(){
        this.style.display = "none";
    },true);
}