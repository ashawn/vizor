var when = require('when');

function AssetService(assetModel) {
	this._model = assetModel;
};

AssetService.prototype.list = function()
{
	var dfd = when.defer();
	this._model
		.find()
		.populate('_creator')
		.exec(function(err, list)
	{
		if (err)
			return dfd.reject(err);
		
		dfd.resolve(list);
	});

	return dfd.promise;
};

AssetService.prototype.canWrite = function(user, name)
{
	return this.findByName(name).then(function(asset)
	{
		return !asset ||
			asset._creator.toString() === user.id.toString();
	});
}

AssetService.prototype.findOne = function(q)
{
	var dfd = when.defer();
	this._model
		.findOne(q)
		.populate('_creator')
		.exec(function(err, item)
	{
		if (err)
			return dfd.reject(err);
		
		dfd.resolve(item);
	});

	return dfd.promise;
};

AssetService.prototype.findByName = function(name)
{
	return this.findOne({name: name});
};

AssetService.prototype.findBySlug = function(slug)
{
	return this.findOne({slug: slug});
};

AssetService.prototype.save = function(data, user)
{
	var that = this;

	return this.findByName(data.name)
	.then(function(asset)
	{
		if (!asset)
			asset = new that._model(data);

		asset._creator = user.id;

		var dfd = when.defer();

		asset.save(function(err)
		{
			if (err)
				return dfd.reject(err);

			dfd.resolve(asset);
		});

		return dfd.promise;
	});
};

module.exports = AssetService;
