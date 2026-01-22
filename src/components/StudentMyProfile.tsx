import React, { useState, useEffect } from 'react';
import {
  Globe,
  DollarSign,
  BookOpen,
  Calendar,
  Briefcase,
  FileText,
  Award,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { userStorage } from '../services/userStorage';
import { getStudentAcademicDetails, getStudentProfileData, StudentAcademicData, StudentProfileData } from '../services/firebaseAcademicService';
import { calculateAge } from '../utils/dateHelpers';

interface StudentMyProfileProps {
  user?: any;
  onNavigateToEssayEditor?: () => void;
}

const StudentMyProfile: React.FC<StudentMyProfileProps> = ({ user, onNavigateToEssayEditor }) => {
  const [academicData, setAcademicData] = useState<StudentAcademicData | null>(null);
  const [profileData, setProfileData] = useState<StudentProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    academicHistory: false,
    personalStatement: false,
    activities: false,
    supplementaryEssays: false,
    careerInterests: false,
  });

  const studentName = user?.name || userStorage.getStoredUser()?.name || 'Student';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('📚 Fetching data for student:', studentName);

        const [academics, profile] = await Promise.all([
          getStudentAcademicDetails(studentName),
          getStudentProfileData(studentName)
        ]);

        setAcademicData(academics);
        setProfileData(profile);
      } catch (error) {
        console.error('Error fetching student data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentName]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleEssayClick = (essayTitle: string) => {
    alert(`To view or edit "${essayTitle}", please go to the Essay Editor tab.`);
    if (onNavigateToEssayEditor) {
      onNavigateToEssayEditor();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#04adee] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const chartData = academicData?.subjectAverages.map(subject => ({
    name: subject.subject.length > 12 ? subject.subject.substring(0, 12) + '...' : subject.subject,
    grade: subject.grade,
    fullName: subject.subject,
  })) || [];

  return (
    <div className="-mx-8 -my-6">
      <div className="bg-gradient-to-r from-[#04ADEE]/10 via-emerald-50 to-[#04ADEE]/10 border-b border-[#04ADEE]/20 px-8 py-5">
        <h2 className="text-2xl font-bold text-slate-900 mb-3">{studentName}</h2>
        {loading ? (
          <div className="flex items-center gap-2 text-slate-500">
            <div className="w-4 h-4 border-2 border-[#04ADEE] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm">Loading profile data...</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {academicData && (
              <div className="bg-white/80 backdrop-blur rounded-lg px-3 py-2 border border-slate-200">
                <div className="text-xs text-slate-600 mb-0.5">Overall Average</div>
                <div className="text-lg font-bold text-[#04ADEE]">{academicData.overallAverage}%</div>
              </div>
            )}
            {(profileData?.sat || profileData?.act) && (
              <div className="bg-white/80 backdrop-blur rounded-lg px-3 py-2 border border-slate-200">
                <div className="text-xs text-slate-600 mb-0.5">{profileData?.sat ? 'SAT' : 'ACT'}</div>
                <div className="text-lg font-bold text-slate-900">
                  {profileData?.sat || profileData?.act || 'N/A'}
                </div>
              </div>
            )}
            {profileData?.dob && (
              <div className="bg-white/80 backdrop-blur rounded-lg px-3 py-2 border border-slate-200">
                <div className="text-xs text-slate-600 mb-0.5">Age</div>
                <div className="text-lg font-bold text-slate-900">{calculateAge(profileData.dob)}</div>
              </div>
            )}
            {profileData?.nationality && (
              <div className="bg-white/80 backdrop-blur rounded-lg px-3 py-2 border border-slate-200">
                <div className="text-xs text-slate-600 mb-0.5">Nationality</div>
                <div className="text-lg font-bold text-slate-900">{profileData.nationality}</div>
              </div>
            )}
            {profileData?.budget && (
              <div className="bg-white/80 backdrop-blur rounded-lg px-3 py-2 border border-slate-200">
                <div className="text-xs text-slate-600 mb-0.5">Budget</div>
                <div className="text-lg font-bold text-slate-900">${parseInt(profileData.budget as string).toLocaleString()}</div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="px-8 py-6 space-y-4">
        {/* Course Grades Chart */}
        {academicData && chartData.length > 0 && (
          <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
            <h3 className="text-base font-semibold text-slate-800 mb-3">Course Grades</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} barSize={35}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-2 border border-slate-200 rounded-lg shadow-lg">
                          <p className="text-xs font-semibold text-slate-800">{payload[0].payload.fullName}</p>
                          <p className="text-base font-bold text-[#04ADEE]">
                            Grade: {payload[0].value}%
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="grade" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => {
                    const colors = ['#04ADEE', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Academic History */}
        {academicData && academicData.previousAverages && academicData.previousAverages.length > 0 && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <button
              onClick={() => toggleSection('academicHistory')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#04ADEE]" />
                <h3 className="text-base font-semibold text-slate-800">Academic History</h3>
              </div>
              {expandedSections.academicHistory ? (
                <ChevronUp className="w-5 h-5 text-slate-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-600" />
              )}
            </button>
            {expandedSections.academicHistory && (
              <div className="px-4 pb-4 border-t border-slate-200">
                <div className="space-y-3 mt-3">
                  {academicData.previousAverages.map((yearData, index) => (
                    <div
                      key={index}
                      className="bg-slate-50 rounded-lg p-4 border border-slate-200"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-sm font-bold text-slate-800">{yearData.year}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">Overall Average:</span>
                          <span className="text-base font-bold text-[#04ADEE]">{yearData.overallAverage}%</span>
                        </div>
                      </div>
                      <div className="border-t border-slate-200 pt-3">
                        <p className="text-xs font-semibold text-slate-700 mb-2">Subject Grades</p>
                        <div className="grid grid-cols-2 gap-2">
                          {yearData.subjects.map((subject, subIndex) => (
                            <div
                              key={subIndex}
                              className="bg-white rounded px-3 py-2 border border-slate-200"
                            >
                              <p className="text-xs text-slate-600 mb-0.5">{subject.subject}</p>
                              <p className="text-sm font-bold text-slate-800">{subject.grade}%</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Personal Statement */}
        {profileData?.personalStatement && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <button
              onClick={() => toggleSection('personalStatement')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#04ADEE]" />
                <h3 className="text-base font-semibold text-slate-800">Personal Statement</h3>
                {profileData.personalStatement.reviewed && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Reviewed</span>
                )}
                {!profileData.personalStatement.reviewed && (
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">Unreviewed</span>
                )}
              </div>
              {expandedSections.personalStatement ? (
                <ChevronUp className="w-5 h-5 text-slate-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-600" />
              )}
            </button>
            {expandedSections.personalStatement && (
              <div className="px-4 pb-4 border-t border-slate-200 mt-3">
                <button
                  onClick={() => handleEssayClick(profileData.personalStatement!.title)}
                  className="text-lg font-semibold text-slate-900 hover:text-slate-700 hover:underline mb-3 block text-left"
                >
                  {profileData.personalStatement.title}
                </button>
                <div
                  className="prose prose-sm max-w-none text-slate-700"
                  dangerouslySetInnerHTML={{ __html: profileData.personalStatement.text }}
                />
              </div>
            )}
          </div>
        )}

        {/* Extracurricular Activities */}
        {profileData?.activitiesList && profileData.activitiesList.length > 0 && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <button
              onClick={() => toggleSection('activities')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#04ADEE]" />
                <h3 className="text-base font-semibold text-slate-800">Extra Curricular Activities</h3>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                  {profileData.activitiesList.length}
                </span>
              </div>
              {expandedSections.activities ? (
                <ChevronUp className="w-5 h-5 text-slate-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-600" />
              )}
            </button>
            {expandedSections.activities && (
              <div className="px-4 pb-4 border-t border-slate-200">
                <div className="space-y-3 mt-3">
                  {profileData.activitiesList.map((activity, index) => (
                    <div key={activity.id} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-[#04ADEE] text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-slate-900 mb-1">{activity.name}</h4>
                          <p className="text-sm text-slate-600">{activity.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Supplementary Essays */}
        {profileData?.supplementaryEssays && profileData.supplementaryEssays.length > 0 && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <button
              onClick={() => toggleSection('supplementaryEssays')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#04ADEE]" />
                <h3 className="text-base font-semibold text-slate-800">Supplementary Essays</h3>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                  {profileData.supplementaryEssays.length}
                </span>
              </div>
              {expandedSections.supplementaryEssays ? (
                <ChevronUp className="w-5 h-5 text-slate-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-600" />
              )}
            </button>
            {expandedSections.supplementaryEssays && (
              <div className="px-4 pb-4 border-t border-slate-200">
                <div className="space-y-3 mt-3">
                  {profileData.supplementaryEssays.map((essay, index) => (
                    <button
                      key={index}
                      onClick={() => handleEssayClick(essay.title)}
                      className="w-full text-left bg-slate-50 rounded-lg p-4 border border-slate-200 hover:border-[#04ADEE] hover:bg-blue-50 transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-slate-900 mb-1">{essay.title}</h4>
                          {essay.universityName && (
                            <p className="text-xs text-slate-600 mb-2">{essay.universityName}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatDate(essay.createdAt)}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {essay.reviewed ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                              <CheckCircle className="w-3.5 h-3.5" />
                              Reviewed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                              <Clock className="w-3.5 h-3.5" />
                              Unreviewed
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Career Interests */}
        {profileData?.careerInterests && profileData.careerInterests.length > 0 && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <button
              onClick={() => toggleSection('careerInterests')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#04ADEE]" />
                <h3 className="text-base font-semibold text-slate-800">Career Interests</h3>
              </div>
              {expandedSections.careerInterests ? (
                <ChevronUp className="w-5 h-5 text-slate-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-600" />
              )}
            </button>
            {expandedSections.careerInterests && (
              <div className="px-4 pb-4 border-t border-slate-200">
                <div className="flex flex-wrap gap-2 mt-3">
                  {profileData.careerInterests.map((interest, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Special Circumstances */}
        {profileData?.specialCircumstances && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <h2 className="text-xl font-bold text-gray-900">Special Circumstances</h2>
            </div>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {profileData.specialCircumstances}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentMyProfile;
