/////////////////////////////////////////////////////
/// Function that generates paginated stuff
/////////////////////////////////////////////////////

function generatePagination(_id,count,limit,cur,target)
{
    if(count<=limit)
        return "";
    var pages=count/limit;
    if(count%limit!=0)
        ++pages;
    var html="<div class='text-center'><ul class='pagination'>";
    for(var i=1;i<=pages;++i)
    {
        html+="<li";
        if(i==cur)
            html+=" class='active'";
        html+="><a href='"+target+"?_id="+_id+"&page="+i+"'>"+i+"</a></li>";
    }
    html+="</ul></div>"
    return html;
}


module.exports={
    generatePagination
}