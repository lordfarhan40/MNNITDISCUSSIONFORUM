const MAX=15;

function generatePagination(_id,threads,cur,target)
{
    if(threads<=MAX)
        return "";
    var pages=threads/MAX;
    if(threads%MAX!=0)
        ++pages;
    var html="<div class='text-center'><ul class='pagination'>";
    for(var i=1;i<=pages;++i)
    {
        html+="<li";
        if(i==cur)
            html+=" class='active'";
        html+="><a href='"+target+"?_id="+_id+"&page="+i+"'>"+i+"</a></li>";
    }
    html+="</ul>"
    return html;
}

module.exports={
    generatePagination
}