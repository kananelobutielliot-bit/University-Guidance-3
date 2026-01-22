import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
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
  TrendingUp,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { userStorage } from '../services/userStorage';
import { getStudentAcademicDetails, getStudentProfileData, StudentAcademicData, StudentProfileData, Essay } from '../services/firebaseAcademicService';
import AnimatedCounter from './AnimatedCounter';
import EssayReview from './EssayReview';

interface StudentMyProfileProps {
  user?: any;
}

const COLORS = ['#04adee', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

const StudentMyProfile: React.FC<StudentMyProfileProps> = ({ user }) => {
  const [academicData, setAcademicData] = useState<StudentAcademicData | null>(null);
  const [profileData, setProfileData] = useState<StudentProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEssayForReview, setSelectedEssayForReview] = useState<Essay | null>(null);

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

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleEssayClick = (essay: Essay) => {
    setSelectedEssayForReview(essay);
  };

  if (selectedEssayForReview) {
    return (
      <EssayReview
        comeFromStudentProfile={true}
        studentName={studentName}
        essayTitle={selectedEssayForReview.title}
        onBackToStudentProfile={() => setSelectedEssayForReview(null)}
      />
    );
  }

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

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
        <div className="flex items-start space-x-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-3xl">
            {studentName.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{studentName}</h1>

            {academicData || profileData ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {profileData?.dob && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-500">Age</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {calculateAge(profileData.dob)} years
                      </p>
                      <p className="text-xs text-gray-400">
                        DOB: {formatDate(profileData.dob)}
                      </p>
                    </div>
                  </div>
                )}

                {profileData?.nationality && (
                  <div className="flex items-center space-x-2">
                    <Globe className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-500">Nationality</p>
                      <p className="text-sm font-semibold text-gray-900">{profileData.nationality}</p>
                    </div>
                  </div>
                )}

                {profileData?.budget && (
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-500">Budget</p>
                      <p className="text-sm font-semibold text-gray-900">
                        ${parseInt(profileData.budget as string).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {academicData?.overallAverage && (
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-500">Overall Average</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {academicData.overallAverage}%
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Academic Performance */}
          {academicData && (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
              <div className="flex items-center space-x-2 mb-4">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Academic Performance</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-[#04adee] bg-opacity-10 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-[#04adee]">{academicData.overallAverage}%</div>
                  <div className="text-sm text-gray-600">Overall Average</div>
                </div>
                <div className="bg-green-100 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{academicData.numCourses}</div>
                  <div className="text-sm text-gray-600">Courses</div>
                </div>
              </div>

              {academicData.subjectAverages && academicData.subjectAverages.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Subject Grades</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={academicData.subjectAverages}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="subject" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="grade" fill="#04adee">
                        {academicData.subjectAverages.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Academic History */}
              {academicData.previousAverages && academicData.previousAverages.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4">Academic History</h3>
                  <div className="space-y-4">
                    {academicData.previousAverages.map((yearData) => (
                      <div key={yearData.year} className="bg-gray-50 rounded-lg p-4">
                        <p className="font-semibold text-gray-900 mb-3">{yearData.year}</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-gray-500">Overall Average</p>
                            <p className="text-sm font-semibold text-gray-900">{yearData.overallAverage}%</p>
                          </div>
                          {yearData.subjects.map((subject) => (
                            <div key={subject.subject}>
                              <p className="text-xs text-gray-500">{subject.subject}</p>
                              <p className="text-sm font-semibold text-gray-900">{subject.grade}%</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Test Scores */}
          {profileData && (profileData.sat || profileData.act) && (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
              <div className="flex items-center space-x-2 mb-4">
                <Award className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Test Scores</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profileData.sat && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-sm text-gray-600 mb-1">SAT</p>
                    <p className="text-2xl font-bold text-blue-600">{profileData.sat}</p>
                  </div>
                )}
                {profileData.act && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-sm text-gray-600 mb-1">ACT</p>
                    <p className="text-2xl font-bold text-blue-600">{profileData.act}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Personal Statement */}
          {profileData?.personalStatement && (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Personal Statement</h2>
              </div>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {profileData.personalStatement.text}
              </p>
              <p className="text-xs text-gray-500 mt-3">
                Last modified: {formatDate(profileData.personalStatement.createdAt)}
              </p>
            </div>
          )}

          {/* Supplementary Essays */}
          {profileData?.supplementaryEssays && profileData.supplementaryEssays.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Supplementary Essays</h2>
                <span className="ml-auto text-sm text-gray-500">
                  {profileData.supplementaryEssays.length} {profileData.supplementaryEssays.length === 1 ? 'essay' : 'essays'}
                </span>
              </div>
              <div className="space-y-3">
                {profileData.supplementaryEssays.map((essay, index) => (
                  <button
                    key={index}
                    onClick={() => handleEssayClick(essay)}
                    className="w-full text-left border border-slate-200 rounded-lg p-4 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{essay.title}</h3>
                        {essay.universityName && (
                          <p className="text-sm text-gray-600 mb-2">{essay.universityName}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(essay.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {essay.reviewed && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Reviewed
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

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Extracurricular Activities */}
          {profileData?.activitiesList && profileData.activitiesList.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
              <div className="flex items-center space-x-2 mb-4">
                <Award className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900">Extracurricular Activities</h2>
              </div>
              <ul className="space-y-3">
                {profileData.activitiesList.map((activity) => (
                  <li key={activity.id} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-semibold">
                      ✓
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{activity.name}</p>
                      {activity.description && (
                        <p className="text-sm text-gray-600">{activity.description}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Career Interests */}
          {profileData?.careerInterests && profileData.careerInterests.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
              <div className="flex items-center space-x-2 mb-4">
                <Briefcase className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900">Career Interests</h2>
              </div>
              <div className="flex flex-wrap gap-2">
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

          {/* Special Circumstances */}
          {profileData?.specialCircumstances && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <h2 className="text-lg font-bold text-gray-900">Special Circumstances</h2>
              </div>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">
                {profileData.specialCircumstances}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentMyProfile;
