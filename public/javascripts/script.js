$(document).ready(function() {

   $.fn.scrollTo = function( target, options, callback ){
  if(typeof options == 'function' && arguments.length == 2){ callback = options; options = target; }
  var settings = $.extend({
    scrollTarget  : target,
    offsetTop     : 50,
    duration      : 500,
    easing        : 'swing'
  }, options);
  return this.each(function(){
    var scrollPane = $(this);
    var scrollTarget = (typeof settings.scrollTarget == "number") ? settings.scrollTarget : $(settings.scrollTarget);
    var scrollY = (typeof scrollTarget == "number") ? scrollTarget : scrollTarget.offset().top + scrollPane.scrollTop() - parseInt(settings.offsetTop);
    scrollPane.animate({scrollTop : scrollY }, parseInt(settings.duration), settings.easing, function(){
      if (typeof callback == 'function') { callback.call(this); }
    });
  });
}



   /* Toggle overlay*/
   $('.close').click(function() {
      $('.overlay').hide();
   });

   /*close vote*/
   $('.voteClose').click(function() {
      $('.voteOverlay').hide();
      $('.voteRes').hide();
      $('.votelink').hide();
      $('.sharelink').hide();
      $('.deletelink').hide();
   });

   $('.showoverlay').click(function() {
      if (this.id === "login") {
         $(".sign").hide();
         $('.overlay').show();
         $('.log').show();
      } else if (this.id === "signin") {
         $(".log").hide();
         $('.overlay').show();
         $('.sign').show();
      }
   });


   /*more button*/
   $(".moreChoice").on('click',function() {

      var div = $("<div>",{
         class:"form-group has-feedback text-center"
        });

      var input = $('<input>', {
         type: "text",
         name: 'choice',
         required: true,
         placeholder: "more..",
         class: "form-control capital"
      })
      var append = $("[name='choice']");

      var icon = $('<i>',{
      class:"form-control-feedback fa fa-times fa-2x moreClose",
      style:"pointer-events:auto",
      onClick:"$(this.parentNode).remove()"
     })

      div.append(input);
      div.append(icon);
      $(div).insertAfter(append[append.length - 1])

   })

   /*all polls polls api call*/

   if (window.location.search.length < 2 && window.location.pathname.toLowerCase() != "/mypolls") {
      $.ajax({
         url: "/polls/all",
      }).done(function(data) {
         data.reverse();
         data.forEach(function(ele) {
            var user = {};
            user.username = ele.username;
            user.name = ele.name;
            user.state = ele.state;
            user.choice = [];
            for (key in ele.choice) {
               var obj = {};
               obj.name = key;
               obj.y = ele.choice[key];
               user.choice.push(obj);
            }
            renderEle(user, ".pollsdiv", {
               link: true,
               del: false
            });
         })
      });

   };

   /*user  polls api call*/

   if (window.Votebook !== undefined && window.Votebook.length > 0) {
      $.ajax({
         url: "/polls/all/user/" + Votebook,
      }).done(function(data) {
         data.reverse();
         data.forEach(function(ele) {
            var user = {};
            user.username = ele.username;
            user.name = ele.name;
            user.state = ele.state;
            user.choice = [];
            for (key in ele.choice) {
               var obj = {};
               obj.name = key;
               obj.y = ele.choice[key];
               user.choice.push(obj);
            }
            var deletable = 'del';
            renderEle(user, ".Userdiv", {
               link: true,
               del: true,
               user: "You"
            });
         })
      });

   }

   /*specific polls api call*/

   if (window.location.search.length > 2) {
      
      $.ajax({
         url: '/polls/all/' + window.location.pathname + window.location.search,
      }).done(function(data) {

         var user = {};
         user.username = data.username;
         user.name = data.name;
         user.state = data.state;
         user.choice = [];
         for (key in data.choice) {
            var obj = {};
            obj.name = key;
            obj.y = data.choice[key];
            user.choice.push(obj);
         }
         renderEle(user, ".Userdiv", {
            link: true,
            del: false

         });
      }).fail(function(){
            $('.voteAvail').hide();
            $('.voteUnavail').show();

      })
   }



   /*create chart dom elements*/
   function renderEle(data, domEle, opt) {

      var div = $('<div>', {
         class: "col-md-8 col-md-push-2 col-xs-12 text-center"
      });
      var thumbnail = $('<div>', {
         class: "thumbnail"
      });
      var inThumb = $('<div>', {
         style: "width:100%, height:100% ",
         class: "contain"
      });
      var creator = $('<p>', {
         text: "created by " + (opt.user || data.username),
      });

      if (opt.link) {
         var voteLink = $('<a>', {
            text: ' Share'
         }).on('click', function() {
            voteRender("sharelink", "/votes/" + data.username + "?id" + "=" + data.name)
         })
      }


      if (opt.del) {
         var delText = $('<p>', {
            text: 'Delete Poll ',
            class: "text-left deletePoll"
         }).on('click', function() {
            voteRender('delete', data.name)
         })

         $(thumbnail).append(delText)
         var delIcon = $('<i>', {
            title: "Delete poll",
            class: "fa fa-trash-o fa-3x "
         })
         $(delText).prepend(delIcon)
      }

      if (data.state === 'private') {
         var state = $('<i>', {
            text: ' ',
            title: "Only Signed can vote",
            class: "fa fa-lock  fa-2x stateIcon"
         })
      } else {
         var state = $('<i>', {
            text: ' ',
            title: "EveryBody can vote",
            class: "fa fa-unlock-alt  fa-2x stateIcon"
         })
      }

      $(domEle).append(div.append(thumbnail.append(inThumb)))
      $(thumbnail).append(creator)
      $(thumbnail).append(state)
      $(thumbnail).append(voteLink)

      /*display chart*/
      showChart(inThumb, data.name, data.choice)
   }



   /*highchart api*/
   function showChart(ele, name, choice) {
        
      $(ele).highcharts({
         chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'

         },
         title: {
            text: name,
            style:{"text-transform":"capitalize"}
         },
         tooltip: {
            pointFormat: "votes ({point.y}): <b>{point.percentage:.1f}%</b> <br />Total votes ({point.total})"
         },
         plotOptions: {
            pie: {
               allowPointSelect: true,
               cursor: 'pointer',
               dataLabels: {
                  enabled: false
               },
               showInLegend: true,
               events: {
                  click: function(event) {
                     voteRender('charts', [event, this])
                  }
               }

            }

         },
         series: [{
            name: name,
            colorByPoint: true,
            data: choice
         }]

      });

   }

   function voteRender(who, data) {
      $('.voteOverlay').show();
      $('.voteRes').show();

     /*voting*/
      if (who == "charts") {
         $('.votelink').show();
         var choice = data[0].point.name;
         var pollname = data[1].name;
          

         $.ajax({
            url: '/polls/all/votes/'+pollname+'/'+choice
         }).done(function(data) {

            setTimeout(function() {
               $(" .rotating").hide()
               $(".initial").hide()
               $(".success").html(data)
               $(".success").show()
            }, 1000)

            setTimeout(function() {
               window.location.reload();
            }, 2000)

         }).fail(function(data){
            setTimeout(function() {
               $(" .rotating").hide()
               $(".initial").hide()
               $(".error").html(data.responseText)
               $(".error").show()
            }, 1000)
            setTimeout(function() {
               window.location.reload();
            }, 2000)

         })



         /*share link*/
      } else if (who == "sharelink") {
         $('.sharelink').show();
         var test = encodeURI(window.location.origin+data);

         $(".shareText").html("copy link"+"<input value="+test+">")


         /*delete poll*/
      } else if (who == "delete") {
         $('.deletelink').show();

         $.ajax({
            url: '/polls/all/delete/' + data
         }).done(function(data) {

            setTimeout(function() {
               $(" .rotating").hide()
               $(".initial").hide()
               $(".success").html(data)
               $(".success").show()
            }, 1000)

            setTimeout(function() {
               window.location.reload();
            }, 2000)
         });

      }


   }
});