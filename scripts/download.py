import arcpy
import os
import csv
from glob import glob
from shutil import rmtree
import itertools
import json


class Toolbox(object):
    def __init__(self):
        self.label = "CSV toolbox"
        self.alias = "HealthCsv"

        # List of tool classes associated with this toolbox
        self.tools = [CreateCsv]


class CreateCsv(object):

    version = '1.1.1'

    def __init__(self, workspace=None):
        self.label = 'Download'
        self.description = 'Download selected health facility data v: ' + self.version
        self.canRunInBackground = True
        self.name = 'FacilityList'
        self.health_facilities = r'C:\mapdata\HealthFacilities.gdb\HealthCareFacilities'
        self.fields = ['Name',
                       'TYPE',
                       'Subcategory',
                       'AdminFirst',
                       'AdminLast',
                       'Address',
                       'City',
                       'ZipCode',
                       'Beds',
                       'CurrentLicense',
                       'LicenseExperiation',
                       'LicNumber',
                       'Phone',
                       'COUNTY']

    def _delete_scratch_data(self, directory, types=None):
        arcpy.AddMessage('--_delete_scratch_data::{}'.format(directory))

        limit = 5000
        i = 0

        if types is None:
            types = ['csv', 'zip', 'pdf']

        items_to_delete = map(lambda x: glob(os.path.join(directory, '*.' + x)), types)
        # flatten [[], []]
        items_to_delete = list(itertools.chain.from_iterable(items_to_delete))

        def remove(thing):
            if os.path.isdir(thing):
                rmtree(thing)
            else:
                os.remove(thing)

        while len(filter(os.path.exists, items_to_delete)) > 0 and i < limit:
            try:
                map(remove, items_to_delete)
            except Exception as e:
                print e
                i += 1

        return True

    def _create_scratch_folder(self, directory):
        arcpy.AddMessage('--_create_scratch_folder::{}'.format(directory))

        if not os.path.exists(directory):
            os.makedirs(directory)

    def _deserialize_json(self, value):
        '''deserializes the parameter json'''
        return json.loads(value)

    def _create_facility_file(self, query, output_file):
        '''create facility list with from health facility data filtered by query'''
        rows = []
        with arcpy.da.SearchCursor(self.health_facilities,
                                   self.fields,
                                   query) as cursor:
            rows = list(cursor)

        with open(output_file, 'wb') as output:
            csv_writer = csv.writer(output)
            csv_writer.writerow(self.fields)
            csv_writer.writerows(rows)

    def getParameterInfo(self):
        '''Returns the parameters required for this tool'''

        p0 = arcpy.Parameter(
            displayName='Filter query',
            name='filter_query',
            datatype='String',
            parameterType='Required',
            direction='Input')

        p1 = arcpy.Parameter(
            displayName='Output CSV file',
            name='output',
            datatype='File',
            parameterType='Derived',
            direction='Output')

        return [p0, p1]

    def execute(self, parameters, messages):
        '''Returns the location on the server of a zip file
        :param paramters: the parameters sent to the gp service
        :param message:
        '''
        arcpy.AddMessage('executing version ' + self.version)
        arcpy.AddMessage(parameters[0].valueAsText)
        # {"query": "FACTYPE IN ('051')"}
        facility_query = self._deserialize_json(parameters[0].valueAsText)
        facility_query = facility_query['query']

        output_location = arcpy.env.scratchFolder

        # not needed when running on server
        self._delete_scratch_data(output_location)

        self._create_scratch_folder(output_location)

        arcpy.AddMessage('-Creating facility list.')
        output_file = os.path.join(output_location, self.name + '.csv')
        self._create_facility_file(facility_query, output_file)

        arcpy.SetParameterAsText(1, output_file)

        return output_file
