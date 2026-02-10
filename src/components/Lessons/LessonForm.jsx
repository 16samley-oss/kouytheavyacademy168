import React, { useState } from 'react';

const LessonForm = ({ initialData = {}, onSubmit, loading = false, courseId }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    video_url: '',
    duration: '',
    order: 0,
    is_published: true,
    course_id: courseId,
    ...initialData,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.course_id) {
      newErrors.course_id = 'Course ID is required';
    }
    
    if (formData.order < 0) {
      newErrors.order = 'Order must be a positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Lesson Title *
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter lesson title"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter lesson description"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Video URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Video URL (YouTube)
          </label>
          <input
            type="url"
            name="video_url"
            value={formData.video_url}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://youtube.com/watch?v=..."
          />
          <p className="mt-1 text-sm text-gray-500">
            Enter YouTube video URL for this lesson
          </p>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duration
          </label>
          <input
            type="text"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 10:30, 45:00"
          />
          <p className="mt-1 text-sm text-gray-500">
            Enter lesson duration (HH:MM)
          </p>
        </div>
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Lesson Content
        </label>
        <textarea
          name="content"
          value={formData.content}
          onChange={handleChange}
          rows={8}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          placeholder="Enter lesson content (HTML/Markdown supported)"
        />
        <p className="mt-1 text-sm text-gray-500">
          You can use HTML or Markdown formatting
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Order */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Order *
          </label>
          <input
            type="number"
            name="order"
            value={formData.order}
            onChange={handleChange}
            min="0"
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.order ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.order && (
            <p className="mt-1 text-sm text-red-600">{errors.order}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Determines the order of lessons (0 = first)
          </p>
        </div>

        {/* Publish Status */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="is_published"
            id="is_published"
            checked={formData.is_published}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <label htmlFor="is_published" className="ml-2 text-sm text-gray-700">
            Publish this lesson immediately
          </label>
        </div>
      </div>

      {/* Hidden Course ID */}
      <input type="hidden" name="course_id" value={formData.course_id} />

      {/* Submit button */}
      <div className="flex justify-end pt-4 space-x-3">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Saving...
            </>
          ) : (
            'Save Lesson'
          )}
        </button>
      </div>
    </form>
  );
};

export default LessonForm;