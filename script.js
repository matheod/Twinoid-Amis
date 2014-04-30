function unserialize( qstr ){
	var r = /([^&=]+)=([^&]*)/g, p = {}, m;
	while (m = r.exec(qstr))
		p[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
	return p;
}
var params = unserialize( location.hash.substr(1) );
if(params['access_token'])
{
	lastVisit = localStorage.getItem('apps-amis-last') || 0;
	if(lastVisit == 0 || new Date().getTime()-lastVisit>1000*60*60*4)
	{
		$.ajax('http://twinoid.com/graph/me',{dataType:'jsonp',data:{'access_token':params['access_token'],fields:'id,contacts.fields(friend,user.fields(id,name))'},success:function(data){
			if(!data.error)
			{
				uid = data.id;
				newFriends = {};
				lostFriends = new Array();
				for(i in data.contacts)
				{
					if(data.contacts[i].friend)
					{
						newFriends[data.contacts[i].user.id] = data.contacts[i].user.name;
					}
				}
				if(lastFriends = JSON.parse(localStorage.getItem('apps-amis-'+uid)))
				{
					for(i in lastFriends)
					{
						if(!newFriends[i])
						{
							lostFriends.push({id:i, name:lastFriends[i]});  // Pas besoins, le flux renvoie d�j� par ordre alphab�tique
							// edit : si JSON parse r�ordonne sinon :/
							// lostFriends.push('<a href="http://twinoid.com/user/'+i+'" target="_blank">'+lastFriends[i]+'</a>');
						}
					}
					lostFriends.sort(function (a,b) {
						a = a.toLowerCase();
						b = b.toLowerCase();
					  if (a.name < b.name)
						 return -1;
					  if (a.name > b.name)
						return 1;
					  return 0;
					});
					if(lostFriends.length>0)
					{
						lostFriendsHtml = new Array();
						for(i in lostFriends)
						{
							lostFriendsHtml.push('<a href="http://twinoid.com/user/'+lostFriends[i].id+'" target="_blank">'+lostFriends[i].name+'</a>');
						}
						$("#texte").html('D\'apr�s mes recherches, ces joueurs t\'ont retir�s de leur liste d\'amis :<br />'+lostFriendsHtml.join(', '));
					}
					else
					{
						$("#texte").html('Aucun ami ne t\'a retir� de sa liste d\'amis ... pour le moment !');
					}
				}
				else
				{
					$("#texte").text('Revenez me voir dans quelque temps pour savoir si vous n\'avez pas perdu d\'amis entre temps ...');
				}
				localStorage.setItem('apps-amis-last',new Date().getTime());
				localStorage.setItem('apps-amis-'+uid,JSON.stringify(newFriends));
			}
			else
			{
				$("#texte").html("Voyez vous mon cher, la vie n\'est pas un long fleuve tranquille.<br />Elle est parsem�e d\'embuches, de probl�mes, et en l\'occurence, il y en a un ...<br /><a href=\"https://twinoid.com/oauth/auth?response_type=token&client_id=15&scope=contacts&state=\">R�essayer</a>");
			}
		}});
	}
	else
	{
		$("#texte").html("Encore vous ?<br />Je sais que les gens peuvent difficilement se passer de moi mais quand m�me !");
		$("#forceReload").show();
		$("#forceReload button").click(function(){localStorage.setItem('apps-amis-last',0);location.reload();});
	}
}
else
{
	$("#texte").html('Bonjour =DD,<br />Je suis le Dr. Juliiiiien, expert en relations amicales.<br />Gr�ce � moi, tu va pouvoir savoir qui t\'a retir� de ta liste d\'amis.<br /><a href="https://twinoid.com/oauth/auth?response_type=token&client_id=15&scope=contacts&state=">Continuer</a>');
}

$("#texte").animate({opacity:1});