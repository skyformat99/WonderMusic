function TopSoaringMp(){
    this.init();
}
TopSoaringMp.prototype = {
    init:function(){
        if(navigator.userAgent.match(/(iPhone|iPod|Android|ios|MSIE|Edge|Trident)/g)){
            alert('抱歉，该您的浏览器不兼容本web应用的部分效果，请在chrome/safari/firefox浏览器内使用本应用。');
            $('body').html('');
        }else{
            this.bind();
            this.getList();
        }
    },
    bind:function(){
        var _this = this;
        var playlistShow = false;
        var playRandom = false;
        this.player = document.querySelector('audio');
        this.player.ontimeupdate = function(){
            _this.timenow = _this.secondsToTime(_this.player.currentTime);
            $('.timenow').text(_this.timenow);
            var barwidth = $('.progress-bar').width(),
                moveValue = barwidth*(_this.player.currentTime/_this.player.duration);
            $('.progress-now').css('left',moveValue);
            $('.buffer-now').css('width',moveValue+10);

            for(var i=0;i<_this.lyric.length;i++){
                var curT = $('.lyriclist li').eq(i).attr('dataTime');
                if (_this.player.currentTime >= curT) {
                    $('.lyriclist li').removeClass('active');
                    $('.lyriclist li').eq(i).addClass('active');
                    $('.lyriclist').css({
                        'top': -25 * (i - 1),
                        'transition': '1s'
                    });
                }
            }
        };
        this.player.oncanplay = function(){
            _this.totaltime = _this.secondsToTime(_this.player.duration);
            $('.timetotal').text(_this.totaltime);
        };
        this.player.onended = function() {
            _this.playSong(_this.idx+1);
        };
        $('.play').on('click',function(){
            if(_this.player.paused){
                _this.player.play();
                $('.play').html('<i class="fa fa-pause-circle">');
                $('.disc').css({'animation-play-state':'running'});
                $('.bgimg').css({'animation-play-state':'running'});
                $('.needle').removeClass('pause');
            }else{
                _this.player.pause();
                $('.play').html('<i class="fa fa-play-circle">');
                $('.disc').css({'animation-play-state':'paused'});
                $('.bgimg').css({'animation-play-state':'paused'});
                $('.needle').addClass('pause');
            }
        });
        $('.backward').on('click',function(){
            if(_this.idx===0){
                return;
            }else{
                if(playRandom){
                    _this.playSong(_this.randomArray[_this.idx-1]);
                }else{
                    _this.playSong(_this.idx-1);
                }
            }
        });
        $('.forward').on('click',function(){
            if(playRandom){
                _this.playSong(_this.randomArray[_this.idx+1]);
            }else{
                _this.playSong(_this.idx+1);
            }
        });
        $('.volume').on('click',function(){
            if(_this.player.volume===0){
                _this.player.volume = 1;
                $('.volume').html('<i class="fa fa-volume-up"></i>')
            }else{
                _this.player.volume = 0;
                $('.volume').html('<i class="fa fa-volume-off"></i>')
            }
        });
        $('.fa-list-ul').on('click',function(){
            if(!playlistShow){
                $('.playlist').show();
                playlistShow = true;
            }else{
                $('.playlist').hide();
                playlistShow = false;
            }
        });
        $('.oneloop').on('click',function(){
            if(!_this.player.loop){
                _this.player.loop = true;
                $('.fa-retweet').css({'color':'#B72712'});
            }else{
                _this.player.loop = false;
                $('.fa-retweet').css({'color':'#fff'});
            }
        });
        $('.random').on('click',function(){
            if(!playRandom){
                $('.fa-random').css({'color':'#B72712'});
                var num = _this.songArray.length;
                _this.randomArray =[];
                for(var i=0;i<num;i++){
                    _this.randomArray[i] = i;
                }
                _this.randomArray.sort(function(){return 0.5 - Math.random()});
                _this.player.onended = function(){
                    _this.playSong(_this.randomArray[_this.idx+1]);
                };
                playRandom = true;
            }else{
                $('.fa-random').css({'color':'#fff'});
                playRandom = false;
                _this.player.onended = function(){
                    _this.playSong(_this.idx+1);
                };
            }
        });
        $('.progress-bar').on('click',function(e){
            var dis = e.clientX-$(this).offset().left;
            _this.moveTo(dis);
        });
        $('.playlist').on('click','.songitem',function(){
            _this.playSong($(this).index());
        });
    },
    getList:function(){
        var _this = this;
        $.ajax({
            url: 'http://www.joycesong.com/api/getPlaylist.php',
            method: 'get',
            dataType: 'json',
            data: {
                playlistid:19723756
            }
        }).done(function($list){
            var list = $list.playlist;
            _this.renderList(list);
            _this.playSong(0);
        });
    },
    getUrl:function(idx){
        var _this = this;
        $.ajax({
            url: 'http://www.joycesong.com/api/getSongUrl.php',
            method: 'get',
            dataType: 'json',
            data: {
                songid:_this.idArray[idx]
            }
        }).done(function($url){
            $('audio').attr('src',$url.data[0].url);
        });
    },
    getLyric:function(idx){
        var _this = this;
        $.ajax({
            url: 'http://www.joycesong.com/api/getLyric.php',
            method: 'get',
            dataType: 'json',
            data: {
                songid:_this.idArray[idx]
            }
        }).done(function($lyric){
            if($lyric.nolyric){
                $('.lyriclist').text('该歌曲无歌词');
            }else{
                $('.lyriclist').text('');
                _this.renderLyric($lyric.lrc.lyric);
            }
        });
    },
    playSong:function(idx){
        this.getUrl(idx);
        this.getLyric(idx);
        this.setImg(idx);
        this.setInfo(idx);
        this.idx = idx;
    },
    setInfo:function(idx){
        var song = this.songArray[idx];
        var singer = this.singerArray[idx];
        var album = this.albumArray[idx];
        $('.s-header').text(song);
        $('.s-album').text('专辑：'+album);
        $('.s-singer').text('歌手：'+singer);
    },
    setImg:function(idx){
        var cover = this.coverArray[idx];
        $('img').attr('src',cover);
        $('body').css({'background-image':'url("' +cover+'")'});
    },
    renderList:function(list){
        var songs = list.tracks;
        var items = '';
        this.songArray =[];
        this.idArray = [];
        this.singerArray = [];
        this.albumArray = [];
        this.coverArray = [];
        for(var i=0;i<songs.length;i++){
            this.songArray.push(songs[i].name);
            this.idArray.push(songs[i].id);
            this.singerArray.push(songs[i].ar[0].name);
            this.albumArray.push(songs[i].name);
            this.coverArray.push(songs[i].al.picUrl);
            items += '<li class="songitem">'+songs[i].name+'</li>';
        }
        $('.playlist').html(items);
    },
    secondsToTime:function(seconds){
        MM = Math.floor(seconds / 60);
        SS = Math.floor(seconds % 60);
        if(SS<10){
            SS = '0'+ SS;
        }
        return MM+':'+SS;
    },
    moveTo:function(x){
        var moveToValue = x/$('.progress-bar').width()*this.player.duration;
        $('.progress-now').css('left',x);
        this.player.currentTime = moveToValue;
    },
    formatLyric: function(lrc) {
        var _this = this;
        var lines = lrc.split('\n'),
            pattern = /^\[\d{2}\:\d{2}\.\d*\]/;
        this.lyricArr = [];
        lines.forEach(function (i) {
            if (!pattern.test(i)) {
                lines.splice(i, 1);
                return;
            }
            var time = i.match(pattern);
            var lyric = i.split(time);
            var seconds = time[0][1] * 600 + time[0][2] * 60 + time[0][4] * 10 + time[0][5] * 1;
            _this.lyricArr.push([seconds, lyric[1]]);
        });
        return this.lyricArr;
    },
    renderLyric: function (lrc) {
        this.lyric = this.formatLyric(lrc);
        var item = '';
        this.lyric.forEach(function (i) {
            item += '<li dataTime ="' + i[0] + '">' + i[1] + '</li>';
        });
        $('.lyriclist').append(item);
    }
};

new TopSoaringMp();


