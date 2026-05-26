// ==MiruExtension==
// @name         AnimeFLV (Español)
// @version      v1.0.1
// @author       Mod-Hayase Developer
// @lang         es
// @license      MIT
// @icon         https://animeflv.net/favicon.ico
// @package      anime.flv.es
// @type         bangumi
// @webSite      https://www3.animeflv.net
// @description  Gran extensión de AnimeFLV para Hayase, optimizada para hispanohablantes con selección de servidor preferido.
// ==/MiruExtension==

export default class extends Extension {
  // Helper to safely extract HTML string from request response
  getHtml(res) {
    if (typeof res === "string") return res;
    if (res && typeof res.data === "string") return res.data;
    if (res && typeof res.text === "string") return res.text;
    return "";
  }

  async req(url) {
    const baseUrl = await this.getSetting("animeflv_url");
    return this.request(url, {
      headers: {
        "Miru-Url": baseUrl,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
  }

  async load() {
    this.registerSetting({
      title: "Servidor Preferido",
      key: "preferred_server",
      type: "select",
      description: "El servidor de video preferido para reproducir",
      defaultValue: "mega",
      options: {
        "mega": "MEGA",
        "sw": "Streamwish",
        "stape": "Streamtape",
        "okru": "Okru"
      }
    });

    this.registerSetting({
      title: "AnimeFLV URL",
      key: "animeflv_url",
      type: "input",
      description: "URL base para AnimeFLV",
      defaultValue: "https://www3.animeflv.net"
    });
  }

  async latest(page) {
    if (page > 1) {
      return [];
    }
    const res = await this.req('/');
    const html = this.getHtml(res);
    const baseUrl = await this.getSetting("animeflv_url");

    const pattern = /<li class="Episode">[\s\S]*?<a href="([^"]+)">[\s\S]*?<img src="([^"]+)" alt="([^"]+)"[\s\S]*?<span class="Capi">([^<]+)<\/span>[\s\S]*?<strong class="Title">([^<]+)<\/strong>/g;
    const results = [];
    let match;

    while ((match = pattern.exec(html)) !== null) {
      const [_, url, cover, alt, cap, title] = match;
      results.push({
        title: `${title.trim()} - ${cap.trim()}`,
        cover: cover.startsWith('http') ? cover : `${baseUrl}${cover}`,
        url: url
      });
    }
    return results;
  }

  async search(kw, page) {
    const encodeKw = encodeURIComponent(kw);
    const res = await this.req(`/browse?q=${encodeKw}&page=${page}`);
    const html = this.getHtml(res);
    const baseUrl = await this.getSetting("animeflv_url");

    const pattern = /<div class="Anime[^"]*">[\s\S]*?<img src="([^"]+)"[^>]*>[\s\S]*?<a class="Button Vrn" href="([^"]+)">Ver Anime<\/a>[\s\S]*?<h3 class="Title">([^<]+)<\/h3>/g;
    const results = [];
    let match;

    while ((match = pattern.exec(html)) !== null) {
      const [_, cover, url, title] = match;
      results.push({
        title: title.trim(),
        cover: cover.startsWith('http') ? cover : `${baseUrl}${cover}`,
        url: url
      });
    }
    return results;
  }

  async detail(url) {
    const res = await this.req(url);
    const html = this.getHtml(res);
    const baseUrl = await this.getSetting("animeflv_url");

    const titleMatch = html.match(/<h1 class="Title">([^<]+)<\/h1>/) || html.match(/<meta property="og:title" content="([^"]+)"/);
    const title = titleMatch ? titleMatch[1].trim() : "Anime";

    const coverMatch = html.match(/<div class="Thumb">[\s\S]*?<img src="([^"]+)"/) || html.match(/<meta property="og:image" content="([^"]+)"/);
    const cover = coverMatch ? (coverMatch[1].startsWith('http') ? coverMatch[1] : `${baseUrl}${coverMatch[1]}`) : "";

    const descMatch = html.match(/<div class="Description"[^>]*>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/);
    const desc = descMatch ? descMatch[1].replace(/<[^>]*>/g, "").trim() : "";

    const infoMatch = html.match(/var anime_info\s*=\s*(\[.*?\]);/);
    const epMatch = html.match(/var episodes\s*=\s*(\[.*?\]);/);

    let urls = [];
    if (infoMatch && epMatch) {
      try {
        const animeInfo = JSON.parse(infoMatch[1]);
        const episodesList = JSON.parse(epMatch[1]);
        const slug = animeInfo[2];
        urls = episodesList.map(ep => {
          const epNum = ep[0];
          return {
            name: `Episodio ${epNum}`,
            url: `/ver/${slug}-${epNum}`
          };
        }).reverse();
      } catch (e) {
        console.error("Error parsing episodes JSON:", e);
      }
    }

    return {
      title,
      cover,
      desc,
      episodes: [
        {
          title: "Episodios",
          urls
        }
      ]
    };
  }

  async watch(url) {
    const res = await this.req(url);
    const html = this.getHtml(res);

    const videoMatch = html.match(/var videos\s*=\s*(\{.*?\});/);
    if (!videoMatch) {
      throw new Error("No se encontraron enlaces de reproducción para este episodio.");
    }

    let videosObj;
    try {
      videosObj = JSON.parse(videoMatch[1]);
    } catch (e) {
      throw new Error("Error al analizar los servidores de video de AnimeFLV.");
    }

    const subList = videosObj.SUB || [];
    const latList = videosObj.LAT || [];
    const allServers = [...subList, ...latList];

    if (allServers.length === 0) {
      throw new Error("No hay servidores de video disponibles.");
    }

    // Find preferred server
    const pref = await this.getSetting("preferred_server");
    let chosen = allServers.find(s => s.server === pref);

    // If preferred server not found, fallback to first available
    if (!chosen) {
      chosen = allServers[0];
    }

    let embedUrl = chosen.code || chosen.url;
    if (embedUrl.includes('<iframe')) {
      const srcMatch = embedUrl.match(/src="([^"]+)"/);
      embedUrl = srcMatch ? srcMatch[1] : embedUrl;
    }

    if (embedUrl.startsWith('//')) {
      embedUrl = 'https:' + embedUrl;
    }

    let type = "iframe";
    if (embedUrl.includes(".mp4")) {
      type = "mp4";
    } else if (embedUrl.includes(".m3u8")) {
      type = "hls";
    }

    // Modern defensive hybrid return format to support all Hayase/Miru variants:
    // 1. Array format (if iterating directly)
    // 2. Object with results array format (if iterating over results)
    // 3. Single object in root format (if reading url/type directly)
    const hybridResult = [
      {
        name: chosen.title || chosen.server || "Reproductor",
        url: embedUrl,
        type: type
      }
    ];

    hybridResult.type = type;
    hybridResult.url = embedUrl;
    hybridResult.results = [
      {
        name: chosen.title || chosen.server || "Reproductor",
        url: embedUrl,
        type: type
      }
    ];

    return hybridResult;
  }
}
