import { App, TFile } from "obsidian";
import axios from "axios";
import { getFrontMatterInfo } from "obsidian";
import { MyPluginSettings } from "./main";

interface DBfile{
    title:string,
    content:string,
    tags:string[]
}

export class dbsync{
	app: App;
	setting:MyPluginSettings;
	baseurl:string;
	constructor(app:App,setting:MyPluginSettings){
		this.app = app
		this.setting = setting
		this.baseurl = this.setting.server_url+":"+this.setting.server_port+"/"
	}

	async initSync(){
		const file = this.app.vault.getFiles()
		file.forEach(async note=>{
			if(note.extension=="md"){
				const DBID = await this.app.fileManager.processFrontMatter(note,(frontmatter)=>{
					return frontmatter['DBID']
				})

				if(typeof DBID=='undefined'){
					const title = note.basename
					const content_row = await this.app.vault.read(note)
					const metadata = getFrontMatterInfo(content_row)

					let content = ""
					let tags: string[] = []
					if(metadata.exists){
						content = content_row.slice(metadata.contentStart,)
						// console.log(content)
					}else{
						content = content_row
					}
					
					let taglist: string[] = []
					await this.app.fileManager.processFrontMatter(note,(frontmatter)=>{
						taglist = frontmatter['tags']
					})

					if((typeof taglist=="undefined")||(taglist ==null)){
						tags = []
					}else{
						tags = taglist
					}

					console.log(tags)

					const packedfile:DBfile = {
						title:title,
						content:content,
						tags:tags
					}

					this.addnew(packedfile,note)
				}

			}
		})
	}

	async addnew(packedfile:DBfile,note:TFile){
		const url = this.baseurl+"api/addnew"
		console.log(url)
		axios.post(url,packedfile)
			.then((res)=>{

				this.app.fileManager.processFrontMatter(note,(frontmatter)=>{
					frontmatter['DBID'] = res.data.DBID
				}).then(()=>{
					console.log(`create new file to DB:${note.basename}`)
				})
				
			})
	}
}
