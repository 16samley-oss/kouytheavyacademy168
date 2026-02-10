import React from 'react';

const CourseCard = ({ course, onEdit, onDelete, onTogglePublish }) => {
  const isPaid = course.course_type === 'paid';

  return (
    <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Course image */}
      <div className="h-48 bg-gray-200 relative">
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <i className="fas fa-book text-4xl text-gray-400"></i>
          </div>
        )}
        
        {/* Course type badge */}
        <div className="absolute top-4 right-4">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              isPaid
                ? 'bg-purple-100 text-purple-800'
                : 'bg-green-100 text-green-800'
            }`}
          >
            {isPaid ? 'PAID' : 'FREE'}
          </span>
        </div>
        
        {/* Publish status */}
        <div className="absolute top-4 left-4">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              course.is_published
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {course.is_published ? 'PUBLISHED' : 'DRAFT'}
          </span>
        </div>
      </div>

      {/* Course info */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
          {course.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {course.description}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-gray-500">
              <i className="fas fa-dollar-sign mr-1"></i>
              <span className="font-medium">{course.price || 'Free'}</span>
            </div>
            
            {course.youtube_url && (
              <div className="flex items-center text-gray-500">
                <i className="fab fa-youtube mr-1"></i>
                <span className="text-sm">Video</span>
              </div>
            )}
          </div>
          
          <div className="text-sm text-gray-500">
            {new Date(course.created_at).toLocaleDateString()}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => onTogglePublish && onTogglePublish(course.id, course.is_published)}
            className={`px-3 py-1 rounded text-sm ${
              course.is_published
                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                : 'bg-green-100 text-green-800 hover:bg-green-200'
            }`}
          >
            {course.is_published ? 'Unpublish' : 'Publish'}
          </button>
          
          <button
            onClick={() => onEdit && onEdit(course.id)}
            className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200"
          >
            Edit
          </button>
          
          <button
            onClick={() => onDelete && onDelete(course.id)}
            className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;