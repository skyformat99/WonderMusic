function GetMusic(){
    this.fmData = ['3778678','19723756','10520166','71385702','2884035','180106','21845217','120001'];
    this.init(0);
}
GetMusic.prototype = {
    init:function(fmIdx){
        this.bind();
        this.getList(this.fmData[fmIdx]);
    },
    bind:function(){
        var _this = this;
        var playRandom = false;
        var clock;
        this.player = document.querySelector('audio');

        this.player.ontimeupdate = function(){
            _this.timenow = _this.secondsToTime(_this.player.currentTime);
            $('.timenow').text(_this.timenow);
            var barwidth = $('.progressbar').outerWidth(),
                moveValue = barwidth*(_this.player.currentTime/_this.player.duration);
            $('.pointnow').css('left',moveValue-8);
            $('.pasttime').css('width',moveValue);
            for(var i=0;i<_this.lyric.length;i++){
                var curT = $('.lyriclist li').eq(i).attr('dataTime');
                if (_this.player.currentTime >= curT) {
                    $('.lyriclist li').removeClass('active');
                    $('.lyriclist li').eq(i).addClass('active');
                    $('.lyriclist').css({
                        'top': -30 * (i - 3),
                        'transition': '1s'
                    });
                }
            }
        };

        this.player.onended = function() {
            _this.playSong(_this.idx+1);
        };

        $('.play').on('click',function(){
            if(_this.player.paused){
                _this.startPlay();
            }else{
                _this.stopPlay();

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
                $('.volume').html('<i class="fa fa-volume-up"></i>');
            }else{
                _this.player.volume = 0;
                $('.volume').html('<i class="fa fa-volume-off"></i>');
            }
        });

        $('.list').on('click',function(){
            if($('#playlist').css('visibility')=='hidden'){
                $('#playlist').css({'visibility':'visible'});
            }else{
                $('#playlist').css({'visibility':'hidden'});
            }
        });

        $('.backtoplayer').on('click',function(){
            $('#playlist').css({'visibility':'hidden'});
        });

        $('.oneloop').on('click',function(){
            if(!_this.player.loop){
                _this.player.loop = true;
                $('.ctrlbtnlist li').eq(0).addClass('active');
            }else{
                _this.player.loop = false;
                $('.ctrlbtnlist li').eq(0).removeClass('active');
            }
        });

        $('.random').on('click',function(){
            if(!playRandom){
                $('.ctrlbtnlist li').eq(4).addClass('active');
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
                $('.ctrlbtnlist li').eq(4).removeClass('active');
                playRandom = false;
                _this.player.onended = function(){
                    _this.playSong(_this.idx+1);
                };
            }
        });

        $('.progressbar').on('click',function(e){
            var dis = e.clientX-$(this).offset().left;
            _this.moveTo(dis);
        });

        $('.songlist').on('click','.songitem',function(){
            _this.playSong($(this).index());
        });

        $('.search').on('keyup',function(e){
            if(e.keyCode == 13){
                _this.searchSong();
                $('#sq').val('');
            }
        });

        $('.chanellist li').on('click',function(){
            _this.getList(_this.fmData[$(this).index()]);
            $('.songlist').scrollTop(0);
        });

        $('.songlist').on('scroll',function(){
            if(clock){
                clearTimeout(clock);
            }
            clock = setTimeout(function(){
                _this.checkShow();
            },300)
        });
    },
    getList:function(fmID){
        var _this = this;
        $.ajax({
            url: 'http://www.joycesong.com/api/getPlaylist.php',
            method: 'get',
            dataType: 'json',
            data: {
                playlistid:fmID
            }
        }).done(function($list){
            var list = $list.playlist;
            _this.renderList(list.tracks);
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
            _this.startPlay();
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
    searchSong:function(){
        var _this = this;
        $.ajax({
            url:'http://www.joycesong.com/api/searchSong.php',
            method:'get',
            dataType:'json',
            data:{
                songkey:$('#sq').val()
            }
        }).done(function($result){
            _this.renderList($result.result.songs);
            $('.songlist').scrollTop(0);
        });
    },
    playSong:function(idx){
        this.resetTime();
        this.getUrl(idx);
        this.getLyric(idx);
        this.setImg(idx);
        this.setInfo(idx);
        this.idx = idx;
        $('.timetotal').text(this.totalTimeArray[idx]);
        $('.songlist li').removeClass('active');
        $('.songlist li').eq(idx).addClass('active');
    },
    startPlay:function(){
        this.player.play();
        if(!this.player.paused){
            $('.play').html('<i class="fa fa-pause-circle fa-4x">');
        }
    },
    stopPlay:function(){
        this.player.pause();
        if(this.player.paused){
            $('.play').html('<i class="fa fa-play-circle fa-4x">');
        }
    },
    setInfo:function(idx){
        var song = this.songArray[idx];
        var singer = this.singerArray[idx];
        var album = this.albumArray[idx];
        $('.s-name').text(song);
        $('.s-singer').text(singer);
    },
    setImg:function(idx){
        var cover = this.coverArray[idx];
        $('.player-cover').css({'background-image':'url("' +cover+'")'});
    },
    renderList:function(list){
        var songs = list;
        var items = '';
        this.songArray =[];
        this.idArray = [];
        this.singerArray = [];
        this.albumArray = [];
        this.coverArray = [];
        this.totalTimeArray = [];
        for(var i=0;i<songs.length;i++){
            this.songArray.push(songs[i].name);
            this.idArray.push(songs[i].id);
            this.singerArray.push(songs[i].ar[0].name);
            this.albumArray.push(songs[i].name);
            this.coverArray.push(songs[i].al.picUrl);
            this.totalTimeArray.push(this.msToTime(songs[i].dt));
            items += '<li class="songitem">';
            items += '<img class="lazy" src="img/blank.png" data-original="'+songs[i].al.picUrl+'">';
            items += '<div class="intro-ct"><p class="i-name">'+songs[i].name+'</p>';
            items += '<p class="i-info">'+songs[i].ar[0].name+'-'+songs[i].al.name+'</p></div>';
            items += '<span class="s-timetotal">'+this.msToTime(songs[i].dt)+'</span></li>';
        }
        $('.songlist').html(items);
        this.checkShow();
    },
    secondsToTime:function(seconds){
        MM = Math.floor(seconds / 60);
        SS = Math.floor(seconds % 60);
        if(SS<10){
            SS = '0'+ SS;
        }
        return MM+':'+SS;
    },
    msToTime:function(ms){
        seconds = ms/1000;
        MM = Math.floor(seconds / 60);
        SS = Math.floor(seconds % 60);
        if(SS<10){
            SS = '0'+ SS;
        }
        return MM+':'+SS;
    },
    moveTo:function(x){
        var moveToValue = x/$('.progressbar').width()*this.player.duration;
        $('.pointnow').css('left',x);
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
    },
    resetTime:function(){
        $('.timenow').text('0:00');
        $('.pointnow').css('left',-8);
        $('.pasttime').css('width',0);
    },
    isShow:function($ele){
        var offsetT = $ele.offset().top,
            winH = $(window).height(),
            scrollT = $('.songlist').scrollTop();
        if(offsetT < winH + scrollT){
            return true;
        }else{
            return false;
        }
    },
    checkShow:function(){
        var _this = this;
        $('img.lazy').each(function(){
            var $crt = $(this);
            if(!$crt.data('loaded')&&_this.isShow($crt)){
                _this.imgShow($crt);
            }
        })
    },
    imgShow:function($ele){
        $ele.attr('src',$ele.attr('data-original'));
        $ele.data('loaded',true);
    }

};
new GetMusic();