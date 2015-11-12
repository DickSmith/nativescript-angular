import {isPresent} from 'angular2/src/core/facade/lang';
import {Promise, PromiseWrapper} from 'angular2/src/core/facade/async';
import {TemplateNormalizer} from 'angular2/src/core/compiler/template_normalizer';
import {XHR} from 'angular2/src/core/compiler/xhr';
import {HtmlParser} from 'angular2/src/core/compiler/html_parser';
import {UrlResolver} from 'angular2/src/core/compiler/url_resolver';
import {CompileTypeMetadata, CompileTemplateMetadata} from 'angular2/src/core/compiler/directive_metadata';
import {path, knownFolders, File} from "file-system";

export class FileSystemTemplateNormalizer extends TemplateNormalizer {
    constructor(xhr: XHR, private urlResolver: UrlResolver,
              domParser: HtmlParser) {
        super(xhr, urlResolver, domParser);
    }

    public normalizeTemplate(directiveType: CompileTypeMetadata, template: CompileTemplateMetadata): Promise<CompileTemplateMetadata> {
        if (!isPresent(template.templateUrl)) {
            return super.normalizeTemplate(directiveType, template);
        }

        let sourceAbsUrl = this.urlResolver.resolve(directiveType.moduleUrl, template.templateUrl);
        return this.loadTemplate(sourceAbsUrl).then(templateContent =>
            this.normalizeLoadedTemplate(directiveType, template, templateContent, sourceAbsUrl));
    }

    public loadTemplate(url: string): Promise<string> {
        let appDir = knownFolders.currentApp().path;
        let templatePath = path.join(appDir, url);

        if (!File.exists(templatePath)) {
            throw new Error(`File ${url} does not exist.`);
        }
        let templateFile = File.fromPath(templatePath);
        return templateFile.readText();
    }
}
