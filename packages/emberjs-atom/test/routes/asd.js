var methods = []
$("#methods").children().each(function(object){
    var name = $(this).find('code').first().text().replace(/[^\w\s]/gi, '');
    var args = $(this).find('.args').first().text().split(',');
    var textsnipet = name +'('+args.map(function(value, index){ return '${'+(index+1) + ':'+value.replace(/[^\w\s]/gi, '')+'}'})+')';
    var descr = $(this).find('.description p').first().text().replace(/[^\w\s]/gi, '')
    var link = 'http://emberjs.com/api/classes/Ember.computed.html#'+ $(this).attr('id');
     methods.push({"name":name,"snippet":textsnipet,"description":descr,"descriptionMoreURL":link ,"leftLabel":name,"type":"property"})
})

JSON.stringify(methods)

this.render('asdsa',{

})

this.get('asd')
