var $ = Dom7;

var resep=[];
resep.push({judul:'Sate Ayam', 
   poster:'http://kbu-cdn.com/dk/wp-content/uploads/sate-ayam.jpg'});
resep.push({judul:'Salad Buah', 
    poster:'https://asset.kompas.com/crops/9tSVPpHIGAnO476dUjI5CteTQxg=/0x217:997x881/750x500/data/photo/2021/01/03/5ff142b238972.jpg'});
resep.push({judul:'Donat meses', 
     poster:'https://www.unileverfoodsolutions.co.id/dam/global-ufs/mcos/SEA/calcmenu/recipes/ID-recipes/desserts-&-bakery/donat-kentang/main-header.jpg'});
resep.push({judul:'Croffle', 
    poster:'https://asset.kompas.com/crops/LMoYWuQ5In78LGHYkfCM3Gt5w4M=/127x97:873x594/750x500/data/photo/2021/07/09/60e7c85cd748b.jpg'});

var device = Framework7.getDevice();
var app = new Framework7({
  name: 'Project Uts', // App name
  theme: 'auto', // Automatic theme detection
  el: '#app', // App root element

  id: 'io.framework7.myapp', // App bundle ID
  // App store
  store: store,
  // App routes
  routes: routes,


  // Input settings
  input: {
    scrollIntoViewOnFocus: device.cordova && !device.electron,
    scrollIntoViewCentered: device.cordova && !device.electron,
  },
  // Cordova Statusbar settings
  statusbar: {
    iosOverlaysWebView: true,
    androidOverlaysWebView: false,
  },
  on: {
    init: function () {
      var f7 = this;
      if (f7.device.cordova) {
        // Init cordova APIs (see cordova-app.js)
        cordovaApp.init(f7);
      }

      $(document).on('page:afterin', function(e,page) {
        if(!localStorage.username) {
          if(page.name != "login" && page.name !="signup"){
            page.router.navigate('/login/');
          }
        }
      });

      $(document).on('page:init', function (e, page) {
        resep.forEach( (t,index) => {
            $("#recent").append(
              "<div class='swiper-slide'><div class='card'>"+
              "<div class='card-header'>" + t.judul +
              "</div><div class='card-content'>"+
              "<img src='"+ t.poster + "' width='100%'>"+ 
              "</div>" +
              "</div></div>");     
          });

        if(page.name == 'home'){
          $('#cari').on('click', function () {
            page.router.navigate('/discovery/');
          })
        }
        if(page.name == 'login'){
          localStorage.removeItem("username");

          $('#btnsignin').on('click',function() {
            app.request.post("http://localhost/recipes/login.php", 
                             { 
                                "user_id": $('#username').val(), 
                                "user_password": $('#password').val() 
                             }, 
                             function(data) {
                              // alert(data);
                var arr =  JSON.parse(data);     
                var result=arr['result'];
                if(result=='success')
                {
                  localStorage.username = $('#username').val();
                  page.router.back('/home/');
                } else {
                  app.dialog.alert('Username atau password salah', 'Login gagal !');
                } 
            });
          });

        }else if(page.name == 'signup'){
          $('#btnsignup').on('click',function() {
            var n = $('#name').val();
            var e = $('#email').val();
            var u = $('#uname').val();
            var p=  $('#pwd').val();
            app.request.post("http://localhost/recipes/signup.php", 
                 { 'name': n, 'email': e, 'username': u, 'password':p },  
                 function(data) {
                    var arr = JSON.parse(data);
                    var result = arr['result'];
                    if(result == 'success') {
                      app.dialog.alert('please login','Account crated successfully');
                    } else {
                      app.dialog.alert(arr['error'],'Account failed to create');
                    }
            });
          });
        }else if(page.name == 'newrecipe') {
          app.request.post("http://localhost/recipes/difficulty.php", {}, function(data) {
            var arr = JSON.parse(data);
            difficulty=arr['data'];

            $("#sel_difficulty").append("<option value=''>-select difficulty-</option>");

            for(var i =0; i < difficulty.length; i++ ) {
              // alert( difficulty[i]['idDifficulty']);
              $('#sel_difficulty').append("<option value='" + difficulty[i]['idDifficulty'] + "'>" + difficulty[i]['name'] 
                                     + "</option>");
            }
          });

          var diff="";
          $('#sel_difficulty').on('change', function() {
            //mengambil nama tingkat kesulitan
            diff=$('#sel_difficulty :checked').text();
            $('#sel_difficulty').append("<li>" + diff + "</li>");
          });

          $('#btnaddbahan').on('click',function(){
            var jmlh_li=$('#ul_ingredient li').length;
            var no=jmlh_li+1;
            $('#ul_ingredient').append(
                "<li class='item-content item-input'>"+
                  "<div class='item-media'>"+
                    "<i class='icon demo-list-icon'>"+no+"</i>"+
                  "</div>"+
                  "<div class='item-inner'>"+
                    "<div class='item-input-wrap'>"+
                      "<input type='text' placeholder='Ingredient "+no+"' id='ingredient_"+no+"' name='ingredient[]' />"+
                        "<span class='input-clear-button'></span>"+
                      "</div>"+
                   " </div>"+ 
                "</li>");
          });

          $('#btnaddstep').on('click',function(){
            var jmlh_li=$('#ul_step li').length;
            var no=jmlh_li+1;
            $('#ul_step').append(
                "<li class='item-content item-input'>"+
                  "<div class='item-media'>"+
                    "<i class='icon demo-list-icon'>"+no+"</i>"+
                  "</div>"+
                  "<div class='item-inner'>"+
                    "<div class='item-input-wrap'>"+
                      "<textarea class='resizable' placeholder='Step "+no+"' id='step_"+no+"' name='steps[]' ></textarea>"+
                        "<span class='input-clear-button'></span>"+
                      "</div>"+
                   " </div>"+ 
                "</li>");
          });

          $('#btnsubmit').on('click',function() {
            var t = $('#tx_title').val();
            var d = $('#tx_description').val();
            var ct = $('#tx_cooktime').val();
            var author= localStorage.getItem("username");
            // alert(author + $("#sel_difficulty").val());
            var li=$('#ul_ingredient li').length;
            var arr_bahan=new Array();
            $("input[name^='ingredient']").each(function(){
                arr_bahan.push($(this).val());
            });
            // alert(arr_bahan);
            var li2=$('#ul_step li').length;
            var arr_step=new Array();
            $("textarea[name^='step']").each(function(){
                arr_step.push($(this).val());
            });

            var g=$('#tx_gambar').val();
      
            app.request.post("http://localhost/recipes/newrecipe.php", 
                 { 'judul': t,'gambar':g, 'durasi': ct, 'deskripsi': d, 'difficulty_id':$("#sel_difficulty").val() , 'username':author, 'ingredients':arr_bahan, 'jmlh_bahan':li, 'steps':arr_step, 'jmlh_step':li2}, 
                 function(data) {
                    var arr = JSON.parse(data);
                    var result = arr['result'];
                    if(result == 'success') {
                      app.dialog.alert('Sukses tambah data');
                      page.router.back('/');
                    } else {
                      app.dialog.alert('Gagal tambah data');
                    }
            });
          });



        }else if(page.name == 'listrecipes'){
          var url = "http://localhost/recipes/listrecipes.php";
          app.request.post(url, {}, function (data) {
            var json = JSON.parse(data);
            recipes = json['data'];
            for(var i=0; i<recipes.length; i++){
              $("#recipes").append(
              "<div class='col-50'><div class='card'>"+
              "<div class='card-header'>" + recipes[i].judul +
              "</div><div class='card-content'>"+
              "<a href=/detailrecipe/" + recipes[i].recipe_id + "><img src='"+ recipes[i].gambar + "' width='100%' height='100px'> </a>"+ 
              "</div><div class='card-footer'> <a href=/detailrecipe2/" + recipes[i].recipe_id + " class='link'>read more..</a></div>" +
              "</div></div>");
            }
          });

        }else if(page.name == 'detailrecipe'){
          var id_recipe= page.router.currentRoute.params.id;
          // alert(id_recipe);
          app.request.post("http://localhost/recipes/detailrecipe.php", {'id':id_recipe}, function(data) {
            var arr = JSON.parse(data);
            recipe=arr['data'];
            $('#content_atas').html(
              '<img src="'+recipe[0]['gambar']+'" width="100%" />'+
                    '<p>Author: '+recipe[0]['fname']+'</p>'+
                    '<p>'+recipe[0]['deskripsi']+'</p>'+
                    '<P>Cooking time: '+recipe[0]['durasi']+'</P>'+
                    '<p>Difficulty: '+recipe[0]['name']+'</p><br>'
            );
            var bahan=recipe["ingredients"];
            //  alert(bahan.length);
            for(var i=0; i<bahan.length; i++) {
                $('#ol_bahan').append('<li>' + bahan[i]['ingredient_name'] + '</li>');
            }
            var steps=recipe["steps"];
            //  alert(steps.length);
            for(var i=0; i<steps.length; i++) {
                $('#ol_step').append('<li>' + steps[i]['step_instruction'] + '</li>');
            }

          });
          $('#btnfavorite').on('click',function () {
            app.request.post("http://localhost/recipes/addfavorite.php", 
                 { 'username':localStorage.getItem("username") , 'recipe_id':id_recipe }, 
                 function(data) {
                    var arr = JSON.parse(data);
                    var result = arr['result'];
                    // alert(result);
                    if(result == 'success') {
                      app.dialog.alert('Recipe has been made favorite');
                    } else {
                      app.dialog.alert('Failed to favorite');
                    }
            });
          });
        }else if(page.name == 'discovery'){
          var url = "http://localhost/recipes/listrecipes.php";

          $('#btncari').on('click', function () {
            var c = $('#txtcari').val();
            app.request.post(url, { cari:c }, function (data) {
              var json = JSON.parse(data);
              recipes = json['data'];
              $('#ul_listrecipe').html('');

              for(var i=0; i<recipes.length; i++){
                $('#ul_listrecipe').append("<li><a href='/detailrecipe/"+recipes[i].recipe_id +"'>" + recipes[i].judul + "</a></li>");
              }
            });
            
          });
        }else if(page.name == 'myrecipe'){
          var url = "http://localhost/recipes/myrecipe.php";
          app.request.post(url, {'username':localStorage.getItem("username")}, function (data) {
            var json = JSON.parse(data);
            recipes = json['data'];
            if(recipes !=null){
            for(var i=0; i<recipes.length; i++){
               $("#recipes").append(
              "<div class='col-50'><div class='card'>"+
              "<div class='card-header'>" + recipes[i].judul +
              "</div><div class='card-content'>"+
              "<a href=/detailrecipe2/" + recipes[i].recipe_id + "><img src='"+ recipes[i].gambar + "' width='100%'> </a>"+ 
              "</div><div class='card-footer'> <a href=/detailrecipe2/" + recipes[i].recipe_id + " class='link'>read more ..</a> </div>" +
              "</div></div>");
            }
            }

          });

        }else if(page.name == 'detailrecipe2'){
          var id_recipe= page.router.currentRoute.params.id;
          // alert(id_recipe);
          app.request.post("http://localhost/recipes/detailrecipe.php", {'id':id_recipe}, function(data) {
            var arr = JSON.parse(data);
            recipe=arr['data'];
            $('#content_atas').html(
              '<img src="'+recipe[0]['gambar']+'" width="100%" />'+
                    '<p>Author: '+recipe[0]['fname']+'</p>'+
                    '<p>Deskripsi: '+recipe[0]['deskripsi']+'</p>'+
                    '<P>Cooking time: '+recipe[0]['durasi']+'</P>'+
                    '<p>Difficulty: '+recipe[0]['name']+'</p><br>'
            );
            var bahan=recipe["ingredients"];
            //  alert(bahan.length);
            for(var i=0; i<bahan.length; i++) {
                $('#ol_bahan').append('<li>' + bahan[i]['ingredient_name'] + '</li>');
            }
            var steps=recipe["steps"];
            //  alert(steps.length);
            for(var i=0; i<steps.length; i++) {
                $('#ol_step').append('<li>' + steps[i]['step_instruction'] + '</li>');
            }
            $('#btnedit').on('click',function() {
              app.view.main.router.navigate('/editrecipe/' + id_recipe,
                        {
                          reloadCurrent: true,
                          pushState: false
                        }
                      );
            });
            $('#btndelete').on('click',function () {
            app.request.post("http://localhost/recipes/deleterecipe.php", 
                 { 'recipe_id':id_recipe }, 
                 function(data) {
                    var arr = JSON.parse(data);
                    var result = arr['result'];
                    // alert(result);
                    if(result == 'success') {
                      app.dialog.alert('Sukses hapus data');
                      app.view.main.router.navigate('/myrecipe/' ,
                        {
                          reloadCurrent: true,
                          pushState: false
                        }
                      );
                    } else {
                      app.dialog.alert('Gagal hapus data');
                    }
            });
          });
          });
        }else if(page.name == 'editrecipe') {
          var id_recipe= page.router.currentRoute.params.id;
          app.request.post("http://localhost/recipes/detailrecipe.php", {'id':id_recipe}, function(data) {
            var arr = JSON.parse(data);
            recipe=arr['data'];
             $('#tx_title').val(recipe[0]['judul']);
             $('#tx_description').val(recipe[0]["deskripsi"]);
             $('#tx_cooktime').val(recipe[0]["durasi"]);
             $('#tx_gambar').val(recipe[0]["gambar"]);
             
          });
          app.request.post("http://localhost/recipes/difficulty.php", {}, function(data) {
            var arr = JSON.parse(data);
            difficulty=arr['data'];

            $("#sel_difficulty").append("<option value=''>-select difficulty-</option>");

            for(var i =0; i < difficulty.length; i++ ) {
              // alert( difficulty[i]['idDifficulty']);
              $('#sel_difficulty').append("<option value='" + difficulty[i]['idDifficulty'] + "'>" + difficulty[i]['name'] 
                                     + "</option>");
            }
          });

          var diff="";
          $('#sel_difficulty').on('change', function() {
            //mengambil nama tingkat kesulitan
            diff=$('#sel_difficulty :checked').text();
            $('#sel_difficulty').append("<li>" + diff + "</li>");
          });

          $('#btnaddbahan').on('click',function(){
            var jmlh_li=$('#ul_ingredient li').length;
            var no=jmlh_li+1;
            $('#ul_ingredient').append(
                "<li class='item-content item-input'>"+
                  "<div class='item-media'>"+
                    "<i class='icon demo-list-icon'>"+no+"</i>"+
                  "</div>"+
                  "<div class='item-inner'>"+
                    "<div class='item-input-wrap'>"+
                      "<input type='text' placeholder='Ingredient "+no+"' id='ingredient_"+no+"' name='ingredient[]' />"+
                        "<span class='input-clear-button'></span>"+
                      "</div>"+
                   " </div>"+ 
                "</li>");
          });

          $('#btnaddstep').on('click',function(){
            var jmlh_li=$('#ul_step li').length;
            var no=jmlh_li+1;
            $('#ul_step').append(
                "<li class='item-content item-input'>"+
                  "<div class='item-media'>"+
                    "<i class='icon demo-list-icon'>"+no+"</i>"+
                  "</div>"+
                  "<div class='item-inner'>"+
                    "<div class='item-input-wrap'>"+
                      "<textarea class='resizable' placeholder='Step "+no+"' id='step_"+no+"' name='steps[]' ></textarea>"+
                        "<span class='input-clear-button'></span>"+
                      "</div>"+
                   " </div>"+ 
                "</li>");
          });

          $('#btnsubmit').on('click',function() {
            var t = $('#tx_title').val();
            var d = $('#tx_description').val();
            var ct = $('#tx_cooktime').val();
            var author= localStorage.getItem("username");
            // alert(author + $("#sel_difficulty").val());
            var li=$('#ul_ingredient li').length;
            var arr_bahan=new Array();
            $("input[name^='ingredient']").each(function(){
                arr_bahan.push($(this).val());
            });
            // alert(arr_bahan);
            var li2=$('#ul_step li').length;
            var arr_step=new Array();
            $("textarea[name^='step']").each(function(){
                arr_step.push($(this).val());
            });

      
            app.request.post("http://localhost/recipes/editrecipe.php", 
                 { 'judul': t, 'durasi': ct, 'deskripsi': d, 'username':author, 'difficulty_id':$("#sel_difficulty").val() ,  'ingredients':arr_bahan, 'jmlh_bahan':li, 'steps':arr_step, 'jmlh_step':li2, 'recipe_id':id_recipe},
                 function(data) {
                    var arr = JSON.parse(data);
                    var result = arr['result'];
                    if(result == 'success') {
                      app.dialog.alert('Sukses edit data');
                      app.view.main.router.navigate('/',
                        {
                          reloadCurrent: true,
                          pushState: false
                        }
                      );
                      
                    } else {
                      app.dialog.alert('Gagal edit data');
                    }
            });
          });


        }else if(page.name == 'favoriterecipe'){
          var author= localStorage.getItem("username");
          var url = "http://localhost/recipes/favorite.php";
          app.request.post(url, {'username':author}, function (data) {
            var json = JSON.parse(data);
            recipes = json['data'];
            if(recipes != null){
            for(var i=0; i<recipes.length; i++){
              $("#ul_favorite").append(
                "<div class='col-50'><div class='card'>"+
              "<div class='card-header'>" + recipes[i].judul +
              "</div><div class='card-content'>"+
              "<a href=/detailrecipe/" + recipes[i].recipe_id + "><img src='"+ recipes[i].gambar + "' width='100%'> </a>"+ 
              "</div><div class='card-footer'> <a href='#' class='link'>read more..</a></div>" +
              "</div></div>"
              );
            }
            }
          });
        }

      });

    },
  },
});