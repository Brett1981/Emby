define(["loading","dialogHelper","dom","components/libraryoptionseditor/libraryoptionseditor","emby-button","listViewStyle","paper-icon-button-light","formDialogStyle"],function(loading,dialogHelper,dom,libraryoptionseditor){"use strict";function addMediaLocation(page,path,networkSharePath){var virtualFolder=currentOptions.library,refreshAfterChange=currentOptions.refresh;ApiClient.addMediaPath(virtualFolder.Name,path,networkSharePath,refreshAfterChange).then(function(){hasChanges=!0,refreshLibraryFromServer(page)},function(){require(["toast"],function(toast){toast(Globalize.translate("ErrorAddingMediaPathToVirtualFolder"))})})}function updateMediaLocation(page,path,networkSharePath){var virtualFolder=currentOptions.library;ApiClient.updateMediaPath(virtualFolder.Name,{Path:path,NetworkPath:networkSharePath}).then(function(){hasChanges=!0,refreshLibraryFromServer(page)},function(){require(["toast"],function(toast){toast(Globalize.translate("ErrorAddingMediaPathToVirtualFolder"))})})}function onRemoveClick(btnRemovePath){var button=btnRemovePath,index=parseInt(button.getAttribute("data-index")),virtualFolder=currentOptions.library,location=virtualFolder.Locations[index];require(["confirm"],function(confirm){confirm({title:Globalize.translate("HeaderRemoveMediaLocation"),text:Globalize.translate("MessageConfirmRemoveMediaLocation"),confirmText:Globalize.translate("ButtonDelete"),primary:"cancel"}).then(function(){var refreshAfterChange=currentOptions.refresh;ApiClient.removeMediaPath(virtualFolder.Name,location,refreshAfterChange).then(function(){hasChanges=!0,refreshLibraryFromServer(dom.parentWithClass(button,"dlg-libraryeditor"))},function(){require(["toast"],function(toast){toast(Globalize.translate("DefaultErrorMessage"))})})})})}function onListItemClick(e){var btnRemovePath=dom.parentWithClass(e.target,"btnRemovePath");if(btnRemovePath)return void onRemoveClick(btnRemovePath);var listItem=dom.parentWithClass(e.target,"listItem");if(listItem){var index=parseInt(listItem.getAttribute("data-index")),page=dom.parentWithClass(listItem,"dlg-libraryeditor");showDirectoryBrowser(page,index)}}function getFolderHtml(pathInfo,index){var html="";html+='<div class="listItem lnkPath" data-index="'+index+'">',html+='<i class="listItemIcon md-icon">folder</i>';var cssClass=pathInfo.NetworkPath?"listItemBody two-line":"listItemBody";return html+='<div class="'+cssClass+'">',html+='<h3 class="listItemBodyText">',html+=pathInfo.Path,html+="</h3>",pathInfo.NetworkPath&&(html+='<div class="listItemBodyText secondary">'+pathInfo.NetworkPath+"</div>"),html+="</div>",html+='<button type="button" is="paper-icon-button-light" class="listItemButton btnRemovePath" data-index="'+index+'"><i class="md-icon">remove_circle</i></button>',html+="</div>"}function refreshLibraryFromServer(page){ApiClient.getVirtualFolders().then(function(result){var library=result.filter(function(f){return f.Name==currentOptions.library.Name})[0];library&&(currentOptions.library=library,renderLibrary(page,currentOptions))})}function renderLibrary(page,options){var pathInfos=(options.library.LibraryOptions||{}).PathInfos||[];pathInfos.length||(pathInfos=options.library.Locations.map(function(p){return{Path:p}}));var foldersHtml=pathInfos.map(getFolderHtml).join("");page.querySelector(".folderList").innerHTML=foldersHtml}function onAddButtonClick(){var page=dom.parentWithClass(this,"dlg-libraryeditor");showDirectoryBrowser(page)}function showDirectoryBrowser(context,listIndex){require(["directorybrowser"],function(directoryBrowser){var picker=new directoryBrowser,pathInfos=(currentOptions.library.LibraryOptions||{}).PathInfos||[],pathInfo=null==listIndex?{}:pathInfos[listIndex]||{},location=null==listIndex?null:currentOptions.library.Locations[listIndex],originalPath=pathInfo.Path||location;picker.show({enableNetworkSharePath:!0,pathReadOnly:null!=listIndex,path:originalPath,networkSharePath:pathInfo.NetworkPath,callback:function(path,networkSharePath){path&&(originalPath?updateMediaLocation(context,originalPath,networkSharePath):addMediaLocation(context,path,networkSharePath)),picker.close()}})})}function initEditor(dlg,options){renderLibrary(dlg,options),dlg.querySelector(".btnAddFolder").addEventListener("click",onAddButtonClick),dlg.querySelector(".folderList").addEventListener("click",onListItemClick),libraryoptionseditor.embed(dlg.querySelector(".libraryOptions"),options.library.CollectionType,options.library.LibraryOptions)}function onDialogClosing(){var dlg=this,libraryOptions=libraryoptionseditor.getLibraryOptions(dlg.querySelector(".libraryOptions"));libraryOptions=Object.assign(currentOptions.library.LibraryOptions||{},libraryOptions),ApiClient.updateVirtualFolderOptions(currentOptions.library.ItemId,libraryOptions)}function onDialogClosed(){loading.hide(),hasChanges=!0,currentDeferred.resolveWith(null,[hasChanges])}function editor(){var self=this;self.show=function(options){var deferred=jQuery.Deferred();currentOptions=options,currentDeferred=deferred,hasChanges=!1;var xhr=new XMLHttpRequest;return xhr.open("GET","components/medialibraryeditor/medialibraryeditor.template.html",!0),xhr.onload=function(e){var template=this.response,dlg=dialogHelper.createDialog({size:"medium",modal:!1,removeOnClose:!0,scrollY:!1});dlg.classList.add("dlg-libraryeditor"),dlg.classList.add("ui-body-a"),dlg.classList.add("background-theme-a"),dlg.classList.add("formDialog"),dlg.innerHTML=Globalize.translateDocument(template),dlg.querySelector(".formDialogHeaderTitle").innerHTML=options.library.Name,initEditor(dlg,options),dlg.addEventListener("closing",onDialogClosing),dlg.addEventListener("close",onDialogClosed),dialogHelper.open(dlg),dlg.querySelector(".btnCancel").addEventListener("click",function(){dialogHelper.close(dlg)}),refreshLibraryFromServer(dlg)},xhr.send(),deferred.promise()}}var currentDeferred,hasChanges,currentOptions;return editor});