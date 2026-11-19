import React from 'react';
import {
  FileText,
  Mail,
  Phone,
  MapPin,
  Link2,
  ExternalLink,
  FolderGit2,
  Globe,
  Sparkles,
  Layers,
  CheckCircle2
} from 'lucide-react';

/**
 * CVPreview Component:
 * - Mode 1 (Uploaded Doc View): Untouched embedded PDF viewer or verbatim DOCX text extractor.
 * - Mode 2 (A4 Template View): Pixel-perfect editorial A4 paper sheet reflecting all live form inputs
 *   including dynamic multi-entry Work Experience and Key Projects.
 */
export const CVPreview = ({
  uploadedFile,
  formValues = {},
  previewView = 'template',
  setPreviewView
}) => {
  const isUploadedDocView = previewView === 'uploaded' && uploadedFile;

  // Process skills pills
  const previewSkills = typeof formValues.skills === 'string'
    ? formValues.skills.split(',').map((s) => s.trim()).filter(Boolean)
    : Array.isArray(formValues.skills)
    ? formValues.skills.map((s) => (typeof s === 'string' ? s.trim() : s)).filter(Boolean)
    : [];

  // Normalize Work Experience list for template rendering
  const normalizedExperience = Array.isArray(formValues.experience)
    ? formValues.experience.filter((exp) => exp && (exp.role || exp.company || exp.description))
    : typeof formValues.experience === 'string' && formValues.experience.trim()
    ? formValues.experience.trim().split(/\n\s*\n+/).filter(Boolean).map((block, idx) => {
        const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
        const header = lines[0] || '';
        const parts = header.split('|').map((p) => p.trim());
        return {
          id: `exp-parsed-${idx}`,
          role: parts[0] || '',
          company: parts[1] || '',
          duration: parts[2] || '',
          location: parts[3] || '',
          description: lines.slice(1).join('\n')
        };
      })
    : [];

  // Normalize Key Projects list for template rendering
  const normalizedProjects = Array.isArray(formValues.projects)
    ? formValues.projects.filter((p) => p && (p.title || p.description))
    : typeof formValues.projects === 'string' && formValues.projects.trim()
    ? formValues.projects.trim().split(/\n\s*\n+/).filter(Boolean).map((block, idx) => {
        const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
        const header = lines[0] || '';
        const parts = header.split('|').map((p) => p.trim());
        const title = parts[0] || '';
        let techStack = '';
        let link = '';
        for (let i = 1; i < parts.length; i++) {
          const part = parts[i];
          if (part.toLowerCase().startsWith('stack:')) {
            techStack = part.replace(/^stack:\s*/i, '').trim();
          } else if (part.startsWith('http') || part.includes('github') || part.includes('.com')) {
            link = part.trim();
          } else if (!techStack) {
            techStack = part.trim();
          }
        }
        return {
          id: `proj-parsed-${idx}`,
          title,
          techStack,
          link,
          description: lines.slice(1).join('\n')
        };
      })
    : [];

  // Process multi-level education
  const normalizedEducation = Array.isArray(formValues.education)
    ? formValues.education.filter((e) => e && (e.level || e.institution || e.major))
    : [];

  // Process certifications
  const previewCertifications = typeof formValues.certifications === 'string'
    ? formValues.certifications
        .split('\n')
        .map((c) => c.replace(/^[•\-\*]\s*/, '').trim())
        .filter(Boolean)
    : [];

  // =========================================================================
  // VIEW MODE 1: Exact Uploaded Document Viewer (PDF iframe or verbatim DOCX)
  // =========================================================================
  if (isUploadedDocView) {
    const isPdf = uploadedFile.type?.includes('pdf') || uploadedFile.name?.toLowerCase().endsWith('.pdf');

    return (
      <div className="space-y-3">
        {/* Subtle Top Notification & Switch Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-base-100 border border-base-300 rounded-xl shadow-2xs">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-base-content/70">Showing Exact Uploaded Document:</span>
            <span className="font-semibold text-primary font-mono truncate max-w-[200px] sm:max-w-[260px]" title={uploadedFile.name}>
              {uploadedFile.name}
            </span>
            <span className="badge badge-xs bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-bold uppercase">
              {isPdf ? 'Original PDF' : 'Original DOCX'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setPreviewView && setPreviewView('template')}
            className="btn btn-xs btn-outline border-base-300 text-primary hover:bg-base-200 gap-1.5 font-semibold self-start sm:self-auto shrink-0"
          >
            <Layers className="w-3.5 h-3.5 text-accent" />
            <span>Switch to Editable A4 Template</span>
          </button>
        </div>

        {/* Embedded Document Frame */}
        {isPdf ? (
          <div className="w-full bg-base-100 rounded-2xl border border-base-300 overflow-hidden shadow-sm h-[850px] relative">
            <iframe
              src={`${uploadedFile.url}#toolbar=1&navpanes=0`}
              title={`Exact Uploaded Document - ${uploadedFile.name}`}
              className="w-full h-full border-0 rounded-2xl bg-base-200/30"
            />
          </div>
        ) : (
          <div className="bg-white border border-base-300 rounded-2xl p-8 shadow-sm text-gray-900 font-sans min-h-[850px]">
            <div className="pb-4 mb-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-gray-500">
                  Verbatim Word Document Content
                </span>
                <h3 className="text-base font-bold text-gray-900 mt-0.5">{uploadedFile.name}</h3>
              </div>
              <span className="badge badge-sm bg-blue-50 text-blue-700 border-blue-200 font-mono font-medium">
                Untouched DOCX
              </span>
            </div>
            <pre className="whitespace-pre-wrap font-sans text-xs text-gray-800 leading-relaxed max-h-[740px] overflow-y-auto pr-2">
              {uploadedFile.rawText || 'No text extracted from document.'}
            </pre>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW MODE 2: Editable Pure-White A4 Resume Paper Sheet
  // =========================================================================
  return (
    <div className="space-y-3">
      {/* Banner when an uploaded file is active in background */}
      {uploadedFile && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-2.5 bg-amber-50/80 border border-amber-200/90 rounded-xl text-xs text-amber-900 shadow-2xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>
              Viewing <strong>Editable A4 Template</strong> (fields synchronized from <em>{uploadedFile.name}</em>)
            </span>
          </div>

          <button
            type="button"
            onClick={() => setPreviewView && setPreviewView('uploaded')}
            className="btn btn-xs bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 gap-1.5 font-semibold self-start sm:self-auto shrink-0 shadow-2xs"
          >
            <FileText className="w-3 h-3 text-amber-700" />
            <span>View Exact Uploaded File</span>
          </button>
        </div>
      )}

      {/* Crisp Pure-White A4 Resume Paper Container */}
      <div
        id="cv-printable-area"
        className="bg-white border border-base-300 rounded-2xl p-8 shadow-sm text-gray-900 transition-all font-sans"
        style={{ minHeight: '842px' }}
      >
        {/* Candidate Header: Name, Target Role, Contact & Links */}
        <div className="border-b border-gray-200 pb-5 mb-5 text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            {formValues.fullName || 'Candidate Full Name'}
          </h2>
          <p className="text-sm font-bold text-amber-700 tracking-wider uppercase mt-1">
            {formValues.targetRole || 'Target Career Title'}
          </p>

          {/* Contact Coordinates */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600 mt-3 justify-center sm:justify-start">
            {formValues.email && (
              <span className="flex items-center gap-1.5">
                <Mail className="w-3 h-3 text-gray-400" />
                <span>{formValues.email}</span>
              </span>
            )}
            {formValues.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="w-3 h-3 text-gray-400" />
                <span>{formValues.phone}</span>
              </span>
            )}
            {formValues.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-gray-400" />
                <span>{formValues.location}</span>
              </span>
            )}
          </div>

          {/* Verification & Portfolio Links */}
          {(formValues.linkedin || formValues.github || formValues.portfolio) && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mt-2 justify-center sm:justify-start pt-2 border-t border-gray-100">
              {formValues.linkedin && (
                <a
                  href={formValues.linkedin.startsWith('http') ? formValues.linkedin : `https://${formValues.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-gray-900 underline underline-offset-2"
                >
                  <Link2 className="w-3 h-3 text-blue-600" />
                  <span>LinkedIn</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
              {formValues.github && (
                <a
                  href={formValues.github.startsWith('http') ? formValues.github : `https://${formValues.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-gray-900 underline underline-offset-2"
                >
                  <FolderGit2 className="w-3 h-3 text-gray-700" />
                  <span>GitHub</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
              {formValues.portfolio && (
                <a
                  href={formValues.portfolio.startsWith('http') ? formValues.portfolio : `https://${formValues.portfolio}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-gray-900 underline underline-offset-2"
                >
                  <Globe className="w-3 h-3 text-emerald-600" />
                  <span>Portfolio</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Section 1: Professional Summary */}
        {formValues.summary && (
          <div className="mb-5">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest border-b border-gray-200 pb-1 mb-2">
              Professional Summary
            </h3>
            <p className="text-xs text-gray-700 leading-relaxed text-justify">
              {formValues.summary}
            </p>
          </div>
        )}

        {/* Section 2: Core Technical Skills */}
        {previewSkills.length > 0 && (
          <div className="mb-5">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest border-b border-gray-200 pb-1 mb-2">
              Technical & Methodological Competencies
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {previewSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="bg-gray-100 text-gray-800 text-[11px] font-mono px-2 py-0.5 rounded border border-gray-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Section 3: Work Experience (Dynamic Multi-Entry Cards) */}
        {normalizedExperience.length > 0 && (
          <div className="mb-5">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest border-b border-gray-200 pb-1 mb-2.5">
              Professional Experience
            </h3>
            <div className="space-y-4">
              {normalizedExperience.map((exp, idx) => {
                const bullets = (exp.description || '')
                  .split('\n')
                  .map((b) => b.replace(/^[•\-\*]\s*/, '').trim())
                  .filter(Boolean);

                return (
                  <div key={exp.id || idx} className="space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between text-xs">
                      <span className="font-bold text-gray-900">
                        {exp.role || 'Position'}{' '}
                        {exp.company && (
                          <span className="font-semibold text-gray-600">@ {exp.company}</span>
                        )}
                      </span>
                      <span className="text-[11px] text-gray-500 font-medium">
                        {[exp.duration, exp.location].filter(Boolean).join(' • ')}
                      </span>
                    </div>

                    {bullets.length > 0 ? (
                      <ul className="list-disc list-outside ml-4 space-y-1 text-xs text-gray-700 leading-relaxed">
                        {bullets.map((b, bIdx) => (
                          <li key={bIdx}>{b}</li>
                        ))}
                      </ul>
                    ) : exp.description ? (
                      <p className="text-xs text-gray-700 leading-relaxed">{exp.description}</p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Section 4: Key Projects (Dynamic Multi-Entry Cards) */}
        {normalizedProjects.length > 0 && (
          <div className="mb-5">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest border-b border-gray-200 pb-1 mb-2.5">
              Key Projects & Systems
            </h3>
            <div className="space-y-3.5">
              {normalizedProjects.map((proj, idx) => {
                const bullets = (proj.description || '')
                  .split('\n')
                  .map((b) => b.replace(/^[•\-\*]\s*/, '').trim())
                  .filter(Boolean);

                return (
                  <div key={proj.id || idx} className="space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between text-xs gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{proj.title || 'Project'}</span>
                        {proj.link && (
                          <a
                            href={proj.link.startsWith('http') ? proj.link : `https://${proj.link}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-0.5 text-[11px] text-blue-600 hover:underline"
                          >
                            <ExternalLink className="w-2.5 h-2.5" />
                            <span>Link</span>
                          </a>
                        )}
                      </div>

                      {proj.techStack && (
                        <span className="text-[11px] font-mono text-gray-500 font-medium">
                          Stack: {proj.techStack}
                        </span>
                      )}
                    </div>

                    {bullets.length > 0 ? (
                      <ul className="list-disc list-outside ml-4 space-y-0.5 text-xs text-gray-700 leading-relaxed">
                        {bullets.map((b, bIdx) => (
                          <li key={bIdx}>{b}</li>
                        ))}
                      </ul>
                    ) : proj.description ? (
                      <p className="text-xs text-gray-700 leading-relaxed">{proj.description}</p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Section 5: Multi-Level Education & Academic Credentials */}
        {normalizedEducation.length > 0 && (
          <div className="mb-5">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest border-b border-gray-200 pb-1 mb-2.5">
              Education & Academic Credentials
            </h3>
            <div className="space-y-2.5">
              {normalizedEducation.map((edu, idx) => (
                <div
                  key={edu.id || idx}
                  className="text-xs pb-2 border-b border-gray-100 last:border-b-0 last:pb-0"
                >
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <span className="font-bold text-gray-900">
                      {edu.level}
                      {edu.major && (
                        <span className="font-medium text-gray-700"> — {edu.major}</span>
                      )}
                    </span>

                    <span className="text-[11px] font-semibold text-gray-600 sm:text-right shrink-0">
                      {[edu.year, edu.grade].filter(Boolean).join(' • ')}
                    </span>
                  </div>

                  {edu.institution && (
                    <p className="text-gray-600 text-[11px] mt-0.5 font-medium">
                      {edu.institution}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 6: Certifications & Honors */}
        {previewCertifications.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest border-b border-gray-200 pb-1 mb-2">
              Certifications & Honors
            </h3>
            <ul className="list-disc list-outside ml-4 space-y-1 text-xs text-gray-700">
              {previewCertifications.map((cert, idx) => (
                <li key={idx} className="font-medium">
                  {cert}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default CVPreview;
